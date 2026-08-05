import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { HomeSectionResponse } from "../../../types/homeSections";

type HomeSectionDetailModalProps = {
  section: HomeSectionResponse | null;
  open: boolean;
  saving?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onEdit?: (section: HomeSectionResponse) => void;
  onActivate?: (section: HomeSectionResponse) => void;
  onDelete?: (section: HomeSectionResponse) => void;
};

export function HomeSectionDetailModal({
  section,
  open,
  saving = false,
  canUpdate = false,
  canDelete = false,
  onClose,
  onEdit,
  onActivate,
  onDelete
}: HomeSectionDetailModalProps) {
  if (!section) {
    return null;
  }

  const title = decodeHtmlEntities(section.title);
  const bookIdsPreview =
    section.bookIds.length > 0 ? section.bookIds.join(", ") : "Nenhum livro vinculado";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={`Detalhes da seção #${section.id}`}
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
                onEdit(section);
                onClose();
              }}
              disabled={saving}
            >
              Editar
            </Button>
          ) : null}
          {canUpdate && onActivate && section.status !== "1" ? (
            <Button
              onClick={() => {
                onActivate(section);
                onClose();
              }}
              disabled={saving}
            >
              Ativar
            </Button>
          ) : null}
          {canDelete && onDelete && section.status === "1" ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(section);
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
      <dl className="grid gap-4">
        <DetailField label="ID" value={`#${section.id}`} />
        <DetailField label="Titulo" value={title} />
        <DetailField label="Status" value={<StatusBadge active={section.status === "1"} />} />
        <DetailField label="Livros" value={`${section.bookCount} livro(s)`} />
      </dl>
      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">IDs dos livros</h3>
        <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">
          {bookIdsPreview}
        </p>
      </div>
    </Modal>
  );
}
