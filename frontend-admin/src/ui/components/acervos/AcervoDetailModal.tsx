import { stripHtml } from "../../../shared/lib/stripHtml";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { AcervoResponse } from "../../../types/acervos";

type AcervoDetailModalProps = {
  acervo: AcervoResponse | null;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onEdit: (acervo: AcervoResponse) => void;
  onDelete: (acervo: AcervoResponse) => void;
};

export function AcervoDetailModal({
  acervo,
  open,
  saving = false,
  onClose,
  onEdit,
  onDelete
}: AcervoDetailModalProps) {
  if (!acervo) {
    return null;
  }

  const name = decodeHtmlEntities(acervo.name);
  const description = stripHtml(acervo.description);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name}
      description={`Detalhes do acervo #${acervo.id}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onEdit(acervo);
              onClose();
            }}
            disabled={saving}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(acervo);
              onClose();
            }}
            disabled={saving}
          >
            Desativar
          </Button>
        </>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label="ID" value={`#${acervo.id}`} />
        <DetailField label="Status" value={<StatusBadge active={acervo.status === "1"} />} />
        <DetailField label="Livros vinculados" value={acervo.bookCount.toLocaleString("pt-BR")} />
        <DetailField label="Usuarios vinculados" value={acervo.userCount.toLocaleString("pt-BR")} />
      </dl>
      {description ? (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Descricao</h3>
          <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">{description}</p>
        </div>
      ) : null}
    </Modal>
  );
}
