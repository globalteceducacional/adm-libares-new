import type { FormEvent } from "react";
import type { UpsertAcervoRequest } from "../../../types/acervos";
import { Modal } from "../../../shared/ui";
import { AcervosForm } from "./AcervosForm";

type AcervoFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertAcervoRequest;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertAcervoRequest) => void;
};

export function AcervoFormModal({
  open,
  editingId,
  form,
  isNameInvalid,
  isFormInvalid,
  saving,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange
}: AcervoFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar acervo" : "Novo acervo"}
      description={
        editingId
          ? `Atualize os dados do acervo #${editingId}.`
          : "Preencha nome e descricao para organizar livros e usuarios por biblioteca."
      }
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <AcervosForm
          form={form}
          editingId={editingId}
          saving={saving}
          isNameInvalid={isNameInvalid}
          isFormInvalid={isFormInvalid}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
