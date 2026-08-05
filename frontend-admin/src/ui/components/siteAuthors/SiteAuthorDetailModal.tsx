import { stripHtml } from "../../../shared/lib/stripHtml";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { SiteAuthorResponse } from "../../../types/siteAuthors";
import { LegacyImage } from "../LegacyImage";

type SiteAuthorDetailModalProps = {
  author: SiteAuthorResponse | null;
  open: boolean;
  saving?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onEdit?: (author: SiteAuthorResponse) => void;
  onActivate?: (author: SiteAuthorResponse) => void;
  onDelete?: (author: SiteAuthorResponse) => void;
};

export function SiteAuthorDetailModal({
  author,
  open,
  saving = false,
  canUpdate = false,
  canDelete = false,
  onClose,
  onEdit,
  onActivate,
  onDelete
}: SiteAuthorDetailModalProps) {
  if (!author) {
    return null;
  }

  const name = decodeHtmlEntities(author.name);
  const description = stripHtml(author.description);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name}
      description={`Detalhes do autor do Site #${author.id}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
          {canUpdate && onEdit ? (
            <Button
              variant="secondary"
              onClick={() => {
                onEdit(author);
                onClose();
              }}
              disabled={saving}
            >
              Editar
            </Button>
          ) : null}
          {canUpdate && onActivate && author.status !== "1" ? (
            <Button
              onClick={() => {
                onActivate(author);
                onClose();
              }}
              disabled={saving}
            >
              Ativar
            </Button>
          ) : null}
          {canDelete && onDelete && author.status === "1" ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(author);
                onClose();
              }}
              disabled={saving}
            >
              Desativar
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[96px_minmax(0,1fr)]">
        <div className="flex justify-center sm:justify-start">
          <LegacyImage
            legacyPath={author.image}
            folder="images"
            alt={`Foto de ${name}`}
            className="table-avatar h-24 w-24 text-lg"
            fallbackClassName="table-avatar-placeholder h-24 w-24 text-lg"
            fallbackText={name.charAt(0).toUpperCase()}
          />
        </div>
        <dl className="grid gap-4">
          <DetailField label="ID" value={`#${author.id}`} />
          <DetailField label="Nome" value={name} />
          <DetailField label="Status" value={<StatusBadge active={author.status === "1"} />} />
        </dl>
      </div>
      {description ? (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Descricao</h3>
          <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">{description}</p>
        </div>
      ) : null}
    </Modal>
  );
}
