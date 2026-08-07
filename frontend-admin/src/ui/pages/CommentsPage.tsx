import { motion } from "framer-motion";
import { Eye, EyeOff, MessageSquare, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { deleteComment, updateCommentStatus } from "../../services/commentsService";
import {
  getQueryErrorMessage,
  useCommentsQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { useSelectedEntity } from "../../hooks/useSelectedEntity";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { CommentDetailModal } from "../components/comments/CommentDetailModal";
import type { CommentResponse } from "../../types/comments";
import { ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function CommentsPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const commentsQuery = useCommentsQuery();
  const invalidate = useInvalidateAdminQueries();
  const comments = commentsQuery.data ?? [];
  const loading = commentsQuery.isLoading;
  const queryError = commentsQuery.error
    ? getQueryErrorMessage(commentsQuery.error, "Falha ao carregar comentarios")
    : undefined;
  const [actionError, setActionError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedComment, setSelectedComment] = useSelectedEntity(comments);
  const error = actionError || queryError;

  async function invalidateCommentQueries() {
    await invalidate.comments();
  }

  const toggleStatusMutation = useAdminMutation<CommentResponse, CommentResponse>({
    mutationFn: (comment) =>
      updateCommentStatus(comment.id, { status: comment.status === "0" ? "1" : "0" }),
    successMessage: (_data, comment) => {
      const nextStatus = comment.status === "0" ? "1" : "0";
      return nextStatus === "1"
        ? "Comentario publicado com sucesso."
        : "Comentario ocultado com sucesso.";
    },
    errorFallback: "Falha ao atualizar status",
    invalidate: invalidateCommentQueries,
    onError: (error) => {
      setActionError(error.message);
    }
  });

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: (commentId) => deleteComment(commentId),
    successMessage: "Comentario excluido com sucesso.",
    errorFallback: "Falha ao excluir comentario",
    invalidate: invalidateCommentQueries,
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

  const saving = toggleStatusMutation.isPending || deleteMutation.isPending;

  function handleToggleStatus(comment: CommentResponse) {
    setActionError("");
    toggleStatusMutation.mutate(comment);
  }

  function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    setActionError("");
    deleteMutation.mutate(confirmDeleteId);
  }

  const columns = useMemo<DataTableColumn<CommentResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (comment) => comment.id },
      { key: "book", label: "Livro", render: (comment) => decodeHtmlEntities(comment.bookTitle) || `#${comment.bookId}` },
      {
        key: "user",
        label: "Usuario",
        render: (comment) => decodeHtmlEntities(comment.userName) || (comment.userId ? `#${comment.userId}` : "-")
      },
      {
        key: "text",
        label: "Comentario",
        tdClassName: "text-truncate-cell",
        render: (comment) => decodeHtmlEntities(comment.commentText)
      },
      {
        key: "status",
        label: "Status",
        render: (comment) => (
          <StatusBadge
            active={comment.status === "1"}
            activeLabel="Publicado"
            inactiveLabel="Oculto"
          />
        )
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (comment) => (
          <TableRowActions>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="table-btn icon"
              type="button"
              onClick={() => handleToggleStatus(comment)}
              disabled={saving}
            >
              {comment.status === "1" ? <EyeOff size={14} /> : <Eye size={14} />}
              {comment.status === "1" ? "Ocultar" : "Publicar"}
            </motion.button>
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
        )
      }
    ],
    [saving]
  );

  const filteredComments = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return comments.filter((comment) => {
      const byStatus = statusFilter === "all" || comment.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(comment.commentText).toLowerCase().includes(normalized) ||
        decodeHtmlEntities(comment.bookTitle ?? "").toLowerCase().includes(normalized) ||
        decodeHtmlEntities(comment.userName ?? "").toLowerCase().includes(normalized) ||
        String(comment.id).includes(normalized);
      return byStatus && byText;
    });
  }, [comments, search, statusFilter]);

  const listStats = useMemo(() => {
    const published = comments.filter((comment) => comment.status === "1").length;
    return [
      { label: "Total", value: comments.length },
      { label: "Publicados", value: published },
      { label: "Ocultos", value: comments.length - published },
      { label: "Exibidos", value: filteredComments.length, hint: "com filtros atuais" }
    ];
  }, [comments, filteredComments]);

  const emptyMessage = useMemo(
    () =>
      `Nenhum comentario encontrado para os filtros aplicados.${
        search || statusFilter !== "all" ? " Limpe os filtros para ver mais resultados." : ""
      }`,
    [search, statusFilter]
  );

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={MessageSquare}
          title="Comentarios"
          description="Modere comentarios publicados nos livros e controle a visibilidade."
          tone="primary"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <AdminListingSection<CommentResponse>
        title="Lista de comentarios"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por livro, usuario, texto ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusActiveLabel="Publicados"
        statusInactiveLabel="Ocultos"
        columns={columns}
        data={filteredComments}
        loading={loading}
        keyExtractor={(comment) => comment.id}
        emptyMessage={emptyMessage}
        countLabel={`${filteredComments.length} comentario(s) com o filtro atual`}
        error={error}
        legendActiveLabel="Publicado"
        legendInactiveLabel="Oculto"
        onRowClick={setSelectedComment}
        renderMobileCard={(comment) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{comment.id}</p>
              <h3>{decodeHtmlEntities(comment.bookTitle) || `Livro #${comment.bookId}`}</h3>
              <p className="book-card-author">
                {decodeHtmlEntities(comment.userName) ||
                  (comment.userId ? `Usuario #${comment.userId}` : "Usuario anonimo")}
              </p>
              <p className="book-card-author">{decodeHtmlEntities(comment.commentText)}</p>
              <StatusBadge
                active={comment.status === "1"}
                activeLabel="Publicado"
                inactiveLabel="Oculto"
              />
            </div>
            <div
              className="book-card-actions"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <TableRowActions>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="table-btn icon"
                  type="button"
                  onClick={() => handleToggleStatus(comment)}
                  disabled={saving}
                >
                  {comment.status === "1" ? <EyeOff size={14} /> : <Eye size={14} />}
                  {comment.status === "1" ? "Ocultar" : "Publicar"}
                </motion.button>
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
          </article>
        )}
      />

      <CommentDetailModal
        comment={selectedComment}
        open={selectedComment !== null}
        saving={saving}
        onClose={() => setSelectedComment(null)}
        onToggleStatus={handleToggleStatus}
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
