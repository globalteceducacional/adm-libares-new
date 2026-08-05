import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { SiteCategoryResponse } from "../../../types/siteCategories";
import { LegacyImage } from "../LegacyImage";

type SiteCategoryDetailModalProps = {
  category: SiteCategoryResponse | null;
  open: boolean;
  saving?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onEdit?: (category: SiteCategoryResponse) => void;
  onActivate?: (category: SiteCategoryResponse) => void;
  onDelete?: (category: SiteCategoryResponse) => void;
};

export function SiteCategoryDetailModal({
  category,
  open,
  saving = false,
  canUpdate = false,
  canDelete = false,
  onClose,
  onEdit,
  onActivate,
  onDelete
}: SiteCategoryDetailModalProps) {
  if (!category) {
    return null;
  }

  const name = decodeHtmlEntities(category.name);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name}
      description={`Detalhes da categoria do Site #${category.id}`}
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
                onEdit(category);
                onClose();
              }}
              disabled={saving}
            >
              Editar
            </Button>
          ) : null}
          {canUpdate && onActivate && category.status !== "1" ? (
            <Button
              onClick={() => {
                onActivate(category);
                onClose();
              }}
              disabled={saving}
            >
              Ativar
            </Button>
          ) : null}
          {canDelete && onDelete && category.status === "1" ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(category);
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
            legacyPath={category.image}
            folder="images"
            alt={`Imagem de ${name}`}
            className="table-avatar h-24 w-24 text-lg"
            fallbackClassName="table-avatar-placeholder h-24 w-24 text-lg"
            fallbackText={name.charAt(0).toUpperCase()}
          />
        </div>
        <dl className="grid gap-4">
          <DetailField label="ID" value={`#${category.id}`} />
          <DetailField label="Nome" value={name} />
          <DetailField label="Status" value={<StatusBadge active={category.status === "1"} />} />
        </dl>
      </div>
    </Modal>
  );
}
