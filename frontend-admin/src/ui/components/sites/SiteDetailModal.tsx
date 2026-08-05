import type { ReactNode } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../../shared/lib/stripHtml";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { SiteResponse } from "../../../types/sites";
import { LegacyImage } from "../LegacyImage";

type SiteDetailModalProps = {
  site: SiteResponse | null;
  open: boolean;
  saving?: boolean;
  authorLabel?: string;
  categoryLabels?: string[];
  canUpdate?: boolean;
  canToggle?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onEdit?: (site: SiteResponse) => void;
  onToggleStatus?: (site: SiteResponse) => void;
  onDelete?: (site: SiteResponse) => void;
};

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-primary underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}

export function SiteDetailModal({
  site,
  open,
  saving = false,
  authorLabel,
  categoryLabels = [],
  canUpdate = false,
  canToggle = false,
  canDelete = false,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete
}: SiteDetailModalProps) {
  if (!site) {
    return null;
  }

  const title = decodeHtmlEntities(site.title);
  const description = stripHtml(site.description);
  const fileUrl = site.fileUrl?.trim();
  const isActive = site.status === "1";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={`Detalhes do site #${site.id}`}
      size="xl"
      footer={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={saving} className="w-full sm:w-auto">
            Fechar
          </Button>
          {canUpdate && onEdit ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                onEdit(site);
                onClose();
              }}
              disabled={saving}
            >
              <Pencil size={16} />
              Editar
            </Button>
          ) : null}
          {canToggle && onToggleStatus ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                onToggleStatus(site);
              }}
              disabled={saving}
            >
              <Power size={16} />
              {isActive ? "Desativar" : "Ativar"}
            </Button>
          ) : null}
          {canDelete && onDelete ? (
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={() => {
                onDelete(site);
                onClose();
              }}
              disabled={saving}
            >
              <Trash2 size={16} />
              Excluir
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid min-w-0 gap-5 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="flex justify-center sm:justify-start">
          <LegacyImage
            legacyPath={site.coverImage}
            folder="images"
            alt={`Capa de ${title}`}
            className="book-detail-cover"
            fallbackClassName="book-detail-cover-placeholder"
            fallbackText="Sem capa"
          />
        </div>

        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <DetailField label="ID" value={`#${site.id}`} />
          <DetailField label="Status" value={<StatusBadge active={isActive} />} />
          <DetailField label="Titulo" value={title} className="sm:col-span-2" />
          <DetailField
            label="Autor"
            value={authorLabel ?? `#${site.authorId}`}
          />
          <DetailField
            label="Destaque"
            value={
              <StatusBadge
                active={site.featured === "1"}
                activeLabel="Sim"
                inactiveLabel="Nao"
              />
            }
          />
          <DetailField
            label="Categorias"
            value={
              categoryLabels.length > 0 ? (
                <span className="acervo-chip-list">
                  {categoryLabels.map((label) => (
                    <span key={label} className="acervo-chip">
                      {label}
                    </span>
                  ))}
                </span>
              ) : (
                "Sem categoria"
              )
            }
            className="sm:col-span-2"
          />
          <DetailField
            label="Visualizacoes"
            value={(site.views ?? 0).toLocaleString("pt-BR")}
          />
          <DetailField
            label="Avaliacao media"
            value={site.rateAvg && site.rateAvg !== "0" ? site.rateAvg : "—"}
          />
          <DetailField
            label="Total de avaliacoes"
            value={(site.totalRate ?? 0).toLocaleString("pt-BR")}
          />
          {site.fileType ? <DetailField label="Tipo de arquivo" value={site.fileType} /> : null}
          {fileUrl ? (
            <DetailField
              label="Arquivo / URL"
              value={<ExternalLink href={fileUrl}>{decodeHtmlEntities(fileUrl)}</ExternalLink>}
              className="sm:col-span-2"
            />
          ) : null}
          {site.coverImage ? (
            <DetailField
              label="Arquivo da capa"
              value={decodeHtmlEntities(site.coverImage)}
              className="sm:col-span-2"
            />
          ) : null}
        </dl>
      </div>

      {description ? (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Descricao</h3>
          <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">
            {description}
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
