import type { FormEvent } from "react";
import type { UpsertSiteSectionRequest } from "../../../types/siteSections";
import { Modal } from "../../../shared/ui";
import { SiteSectionsForm } from "./SiteSectionsForm";

type SiteOption = {
  id: number;
  title: string;
};

type SiteSectionFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertSiteSectionRequest;
  isTitleInvalid: boolean;
  sitesLoading: boolean;
  activeSites: SiteOption[];
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertSiteSectionRequest) => void;
  onToggleSite: (siteId: number) => void;
};

export function SiteSectionFormModal({
  open,
  editingId,
  form,
  isTitleInvalid,
  sitesLoading,
  activeSites,
  saving,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange,
  onToggleSite
}: SiteSectionFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar seção do Site" : "Nova seção do Site"}
      description={
        editingId
          ? `Atualize a seção #${editingId} e os sites vinculados.`
          : "Defina o titulo, status e os sites vinculados a esta seção."
      }
      size="xl"
      className="max-w-4xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body max-h-[70vh] overflow-y-auto pr-1">
        <SiteSectionsForm
          form={form}
          editingId={editingId}
          saving={saving}
          isTitleInvalid={isTitleInvalid}
          sitesLoading={sitesLoading}
          activeSites={activeSites}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onToggleSite={onToggleSite}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
