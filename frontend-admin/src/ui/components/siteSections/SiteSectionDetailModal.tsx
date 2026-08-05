import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { SiteSectionResponse } from "../../../types/siteSections";

type SiteSectionDetailModalProps = {
  section: SiteSectionResponse | null;
  open: boolean;
  saving?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onEdit?: (section: SiteSectionResponse) => void;
  onActivate?: (section: SiteSectionResponse) => void;
  onDelete?: (section: SiteSectionResponse) => void;
};

export function SiteSectionDetailModal({
  section,
  open,
  saving = false,
  canUpdate = false,
  canDelete = false,
  onClose,
  onEdit,
  onActivate,
  onDelete
}: SiteSectionDetailModalProps) {
  if (!section) {
    return null;
  }

  const title = decodeHtmlEntities(section.title);
  const siteIdsPreview =
    section.siteIds.length > 0 ? section.siteIds.join(", ") : "Nenhum site vinculado";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={`Detalhes da seção do Site #${section.id}`}
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
        <DetailField label="Sites" value={`${section.siteCount} site(s)`} />
      </dl>
      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">IDs dos sites</h3>
        <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">
          {siteIdsPreview}
        </p>
      </div>
    </Modal>
  );
}
