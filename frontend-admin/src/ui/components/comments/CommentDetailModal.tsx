import { Eye, EyeOff, Trash2 } from "lucide-react";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { CommentResponse } from "../../../types/comments";

type CommentDetailModalProps = {
  comment: CommentResponse | null;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onToggleStatus: (comment: CommentResponse) => void;
  onDelete: (comment: CommentResponse) => void;
};

export function CommentDetailModal({
  comment,
  open,
  saving = false,
  onClose,
  onToggleStatus,
  onDelete
}: CommentDetailModalProps) {
  if (!comment) {
    return null;
  }

  const bookTitle = decodeHtmlEntities(comment.bookTitle) || `Livro #${comment.bookId}`;
  const userName =
    decodeHtmlEntities(comment.userName) ||
    (comment.userId ? `Usuario #${comment.userId}` : "Usuario anonimo");
  const text = decodeHtmlEntities(comment.commentText);
  const isPublished = comment.status === "1";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Comentario #${comment.id}`}
      description={bookTitle}
      size="lg"
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onToggleStatus(comment);
              onClose();
            }}
            disabled={saving}
          >
            {isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPublished ? "Ocultar" : "Publicar"}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(comment);
              onClose();
            }}
            disabled={saving}
          >
            <Trash2 size={16} />
            Excluir
          </Button>
        </>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label="ID" value={`#${comment.id}`} />
        <DetailField
          label="Status"
          value={
            <StatusBadge active={isPublished} activeLabel="Publicado" inactiveLabel="Oculto" />
          }
        />
        <DetailField label="Livro" value={bookTitle} className="sm:col-span-2" />
        <DetailField label="ID do livro" value={`#${comment.bookId}`} />
        <DetailField label="Usuario" value={userName} />
        {comment.commentOn ? (
          <DetailField label="Data" value={decodeHtmlEntities(comment.commentOn)} className="sm:col-span-2" />
        ) : null}
      </dl>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Comentario</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
      </div>
    </Modal>
  );
}
