import type { ChangeEvent, FormEvent } from "react";
import type { UpsertCategoryRequest } from "../../../types/categories";
import { Modal } from "../../../shared/ui";
import { CategoriesForm } from "./CategoriesForm";

type CategoryFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertCategoryRequest;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
  saving: boolean;
  uploadingImage: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertCategoryRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function CategoryFormModal({
  open,
  editingId,
  form,
  isNameInvalid,
  isFormInvalid,
  saving,
  uploadingImage,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange,
  onImageChange
}: CategoryFormModalProps) {
  const isBusy = saving || uploadingImage;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar categoria" : "Nova categoria"}
      description={
        editingId
          ? `Atualize os dados da categoria #${editingId}.`
          : "Preencha nome e imagem para organizar as categorias do catalogo."
      }
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!isBusy}
    >
      <div className="book-form-modal-body">
        <CategoriesForm
          form={form}
          editingId={editingId}
          saving={saving}
          uploadingImage={uploadingImage}
          isNameInvalid={isNameInvalid}
          isFormInvalid={isFormInvalid}
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
