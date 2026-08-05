import type { ChangeEvent, FormEvent } from "react";
import type { UpsertAuthorRequest } from "../../../types/authors";
import { Modal } from "../../../shared/ui";
import { AuthorsForm } from "./AuthorsForm";

type AuthorFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertAuthorRequest;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
  saving: boolean;
  uploadingImage: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertAuthorRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function AuthorFormModal({
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
}: AuthorFormModalProps) {
  const isBusy = saving || uploadingImage;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar autor" : "Novo autor"}
      description={
        editingId
          ? `Atualize os dados do autor #${editingId}.`
          : "Preencha nome, descricao e foto para o catalogo de autores."
      }
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!isBusy}
    >
      <div className="book-form-modal-body">
        <AuthorsForm
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
