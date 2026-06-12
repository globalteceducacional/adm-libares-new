import { motion } from "framer-motion";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteComment, updateCommentStatus } from "../../services/commentsService";
import {
  getQueryErrorMessage,
  useCommentsQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import type { CommentResponse } from "../../types/comments";
import { StatusBadge } from "../../shared/ui";
import { type DataTableColumn } from "../components/table/DataTable";

export function CommentsPage() {
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const commentsQuery = useCommentsQuery();
  const invalidate = useInvalidateAdminQueries();
  const comments = commentsQuery.data ?? [];
  const loading = commentsQuery.isLoading;
  const queryError = commentsQuery.error
    ? getQueryErrorMessage(commentsQuery.error, "Falha ao carregar comentarios")
    : undefined;
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const error = actionError || queryError;

  async function handleToggleStatus(comment: CommentResponse) {
    setActionError("");
    clearSuccess();
    setSaving(true);
    try {
      const nextStatus = comment.status === "0" ? "1" : "0";
      await updateCommentStatus(comment.id, { status: nextStatus });
      showSuccess(nextStatus === "1" ? "Comentario publicado com sucesso." : "Comentario ocultado com sucesso.");
      await invalidate.comments();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Falha ao atualizar status";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(commentId: number) {
    const confirmed = window.confirm("Deseja excluir este comentario?");
    if (!confirmed) {
      return;
    }
    setActionError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteComment(commentId);
      showSuccess("Comentario excluido com sucesso.");
      await invalidate.comments();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Falha ao excluir comentario";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo<DataTableColumn<CommentResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (comment) => comment.id },
      { key: "book", label: "Livro", render: (comment) => comment.bookTitle || `#${comment.bookId}` },
      {
        key: "user",
        label: "Usuario",
        render: (comment) => comment.userName || (comment.userId ? `#${comment.userId}` : "-")
      },
      {
        key: "text",
        label: "Comentario",
        tdClassName: "text-truncate-cell",
        render: (comment) => comment.commentText
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
          <>
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
              onClick={() => handleDelete(comment.id)}
              disabled={saving}
            >
              <Trash2 size={14} />
              Excluir
            </motion.button>
          </>
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
        comment.commentText.toLowerCase().includes(normalized) ||
        (comment.bookTitle ?? "").toLowerCase().includes(normalized) ||
        (comment.userName ?? "").toLowerCase().includes(normalized) ||
        String(comment.id).includes(normalized);
      return byStatus && byText;
    });
  }, [comments, search, statusFilter]);

  const emptyMessage = useMemo(
    () =>
      `Nenhum comentario encontrado para os filtros aplicados.${
        search || statusFilter !== "all" ? " Limpe os filtros para ver mais resultados." : ""
      }`,
    [search, statusFilter]
  );

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <AdminListingSection<CommentResponse>
        title="Gestao de Comentarios"
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
        success={success}
        legendActiveLabel="Publicado"
        legendInactiveLabel="Oculto"
        renderMobileCard={(comment) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{comment.id}</p>
              <h3>{comment.bookTitle || `Livro #${comment.bookId}`}</h3>
              <p className="book-card-author">
                {comment.userName || (comment.userId ? `Usuario #${comment.userId}` : "Usuario anonimo")}
              </p>
              <p className="book-card-author">{comment.commentText}</p>
              <StatusBadge
                active={comment.status === "1"}
                activeLabel="Publicado"
                inactiveLabel="Oculto"
              />
            </div>
            <div className="book-card-actions">
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
                onClick={() => handleDelete(comment.id)}
                disabled={saving}
              >
                <Trash2 size={14} />
                Excluir
              </motion.button>
            </div>
          </article>
        )}
      />
    </motion.section>
  );
}
