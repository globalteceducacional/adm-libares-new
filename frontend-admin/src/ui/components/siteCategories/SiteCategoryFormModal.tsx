import type { ChangeEvent, FormEvent } from "react";
import type { UpsertSiteCategoryRequest } from "../../../types/siteCategories";
import { Modal } from "../../../shared/ui";
import { SiteCategoriesForm } from "./SiteCategoriesForm";

type SiteCategoryFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertSiteCategoryRequest;
  isNameInvalid: boolean;
  saving: boolean;
  uploadingImage: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertSiteCategoryRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SiteCategoryFormModal({
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
}: SiteCategoryFormModalProps) {
  const isBusy = saving || uploadingImage;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar categoria do Site" : "Nova categoria do Site"}
      description={
        editingId
          ? `Atualize os dados da categoria #${editingId}.`
          : "Defina nome, imagem e status da categoria Site."
      }
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!isBusy}
    >
      <div className="book-form-modal-body">
        <SiteCategoriesForm
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
