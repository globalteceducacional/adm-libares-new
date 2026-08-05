import type { ChangeEvent, FormEvent } from "react";
import type { UpsertSiteAuthorRequest } from "../../../types/siteAuthors";
import { Modal } from "../../../shared/ui";
import { SiteAuthorsForm } from "./SiteAuthorsForm";

type SiteAuthorFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertSiteAuthorRequest;
  isNameInvalid: boolean;
  saving: boolean;
  uploadingImage: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertSiteAuthorRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SiteAuthorFormModal({
  open,
  editingId,
  form,
  isNameInvalid,
  saving,
  uploadingImage,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange,
  onImageChange
}: SiteAuthorFormModalProps) {
  const isBusy = saving || uploadingImage;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar autor do Site" : "Novo autor do Site"}
      description={
        editingId
          ? `Atualize os dados do autor #${editingId}.`
          : "Preencha nome, descricao e foto para o catalogo Site."
      }
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!isBusy}
    >
      <div className="book-form-modal-body">
        <SiteAuthorsForm
          form={form}
          editingId={editingId}
          saving={saving}
          uploadingImage={uploadingImage}
          isNameInvalid={isNameInvalid}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onImageChange={onImageChange}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
