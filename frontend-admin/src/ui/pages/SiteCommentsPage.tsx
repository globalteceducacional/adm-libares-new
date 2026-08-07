import { motion } from "framer-motion";
import { MessageSquare, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { deleteSiteComment } from "../../services/siteCommentsService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSiteCommentsQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { usePermission } from "../../features/auth/usePermission";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { useSelectedEntity } from "../../hooks/useSelectedEntity";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { SiteCommentDetailModal } from "../components/siteComments/SiteCommentDetailModal";
import type { SiteCommentResponse } from "../../types/siteComments";
import { ConfirmDialog } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function SiteCommentsPage() {
  const location = useLocation();
  const { search, setSearch } = useAdminListFilters({ syncStatus: false });
  const commentsQuery = useSiteCommentsQuery();
  const invalidate = useInvalidateAdminQueries();
  const comments = commentsQuery.data ?? [];
  const loading = commentsQuery.isLoading;
  const queryError = commentsQuery.error
    ? getQueryErrorMessage(commentsQuery.error, "Falha ao carregar comentarios do Site")
    : undefined;
  const [actionError, setActionError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedComment, setSelectedComment] = useSelectedEntity(comments);
  const canModerate = usePermission("sites.comments.moderate");
  const error = actionError || queryError;

  async function invalidateSiteCommentQueries() {
    await invalidate.siteComments();
  }

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: (commentId) => deleteSiteComment(commentId),
    successMessage: "Comentario excluido com sucesso.",
    errorFallback: "Falha ao excluir comentario",
    invalidate: invalidateSiteCommentQueries,
    onSuccess: (_data, commentId) => {
      if (selectedComment?.id === commentId) {
        setSelectedComment(null);
      }
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      setActionError(error.message);
      setConfirmDeleteId(null);
    }
  });

  const saving = deleteMutation.isPending;

  function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    setActionError("");
    deleteMutation.mutate(confirmDeleteId);
  }

  const columns = useMemo<DataTableColumn<SiteCommentResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (comment) => comment.id },
      {
        key: "site",
        label: "Site",
        render: (comment) => `#${comment.siteId}`
      },
      {
        key: "user",
        label: "Usuario",
        render: (comment) =>
          decodeHtmlEntities(comment.userName) || (comment.userId ? `#${comment.userId}` : "-")
      },
      {
        key: "email",
        label: "Email",
        render: (comment) => comment.userEmail || "-"
      },
      {
        key: "text",
        label: "Comentario",
        tdClassName: "text-truncate-cell",
        render: (comment) => decodeHtmlEntities(comment.commentText)
      },
      {
        key: "date",
        label: "Data",
        render: (comment) => comment.commentOn || comment.dtRate || "-"
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (comment) =>
          canModerate ? (
            <TableRowActions>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(comment.id)}
                disabled={saving}
                aria-label={`Excluir o comentario #${comment.id}`}
              >
                <Trash2 size={14} />
                Excluir
              </motion.button>
            </TableRowActions>
          ) : null
      }
    ],
    [saving, canModerate]
  );

  const filteredComments = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return comments.filter((comment) => {
      return (
        normalized.length === 0 ||
        decodeHtmlEntities(comment.commentText).toLowerCase().includes(normalized) ||
        decodeHtmlEntities(comment.userName ?? "").toLowerCase().includes(normalized) ||
        (comment.userEmail ?? "").toLowerCase().includes(normalized) ||
        String(comment.siteId).includes(normalized) ||
        String(comment.id).includes(normalized)
      );
    });
  }, [comments, search]);

  const listStats = useMemo(
    () => [
      { label: "Total", value: comments.length },
      { label: "Exibidos", value: filteredComments.length, hint: "com filtros atuais" }
    ],
    [comments.length, filteredComments.length]
  );

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={MessageSquare}
          title="Comentarios do Site"
          description="Modere comentarios publicados nos conteudos do catalogo Site."
          tone="primary"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <AdminListingSection<SiteCommentResponse>
        title="Lista de comentarios"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por site, usuario, texto ou ID"
        columns={columns}
        data={filteredComments}
        loading={loading}
        keyExtractor={(comment) => comment.id}
        emptyMessage="Nenhum comentario encontrado para os filtros aplicados."
        countLabel={`${filteredComments.length} comentario(s) com o filtro atual`}
        error={error}
        onRowClick={setSelectedComment}
        renderMobileCard={(comment) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{comment.id}</p>
              <h3>Site #{comment.siteId}</h3>
              <p className="book-card-author">
                {decodeHtmlEntities(comment.userName) ||
                  (comment.userId ? `Usuario #${comment.userId}` : "Usuario anonimo")}
              </p>
              <p className="book-card-author">{decodeHtmlEntities(comment.commentText)}</p>
            </div>
            {canModerate ? (
              <div
                className="book-card-actions"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <TableRowActions>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="table-btn danger icon"
                    type="button"
                    onClick={() => setConfirmDeleteId(comment.id)}
                    disabled={saving}
                    aria-label={`Excluir o comentario #${comment.id}`}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </motion.button>
                </TableRowActions>
              </div>
            ) : null}
          </article>
        )}
      />

      <SiteCommentDetailModal
        comment={selectedComment}
        open={selectedComment !== null}
        saving={saving}
        canModerate={canModerate}
        onClose={() => setSelectedComment(null)}
        onDelete={(comment) => setConfirmDeleteId(comment.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir comentario"
        description="Esta acao nao pode ser desfeita. Deseja realmente excluir este comentario?"
        confirmLabel="Excluir"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
