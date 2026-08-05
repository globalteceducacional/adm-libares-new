import { Trash2 } from "lucide-react";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal } from "../../../shared/ui";
import type { SiteCommentResponse } from "../../../types/siteComments";

type SiteCommentDetailModalProps = {
  comment: SiteCommentResponse | null;
  open: boolean;
  saving?: boolean;
  canModerate?: boolean;
  onClose: () => void;
  onDelete?: (comment: SiteCommentResponse) => void;
};

export function SiteCommentDetailModal({
  comment,
  open,
  saving = false,
  canModerate = false,
  onClose,
  onDelete
}: SiteCommentDetailModalProps) {
  if (!comment) {
    return null;
  }

  const siteLabel = `Site #${comment.siteId}`;
  const userName =
    decodeHtmlEntities(comment.userName) ||
    (comment.userId ? `Usuario #${comment.userId}` : "Usuario anonimo");
  const text = decodeHtmlEntities(comment.commentText);
  const dateLabel = comment.commentOn || comment.dtRate || null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Comentario #${comment.id}`}
      description={siteLabel}
      size="lg"
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
          {canModerate && onDelete ? (
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
          ) : null}
        </>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label="ID" value={`#${comment.id}`} />
        <DetailField label="Site" value={siteLabel} />
        <DetailField label="Usuario" value={userName} />
        <DetailField label="Email" value={comment.userEmail || "-"} />
        {dateLabel ? (
          <DetailField
            label="Data"
            value={decodeHtmlEntities(dateLabel)}
            className="sm:col-span-2"
          />
        ) : null}
      </dl>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Comentario</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
      </div>
    </Modal>
  );
}
