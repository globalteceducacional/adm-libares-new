import { stripHtml } from "../../../shared/lib/stripHtml";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { AuthorResponse } from "../../../types/authors";
import { LegacyImage } from "../LegacyImage";

type AuthorDetailModalProps = {
  author: AuthorResponse | null;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onEdit: (author: AuthorResponse) => void;
  onDelete: (author: AuthorResponse) => void;
};

export function AuthorDetailModal({
  author,
  open,
  saving = false,
  onClose,
  onEdit,
  onDelete
}: AuthorDetailModalProps) {
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
      description={`Detalhes do autor #${author.id}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
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
