import type { FormEvent } from "react";
import type { UpsertAcervoRequest } from "../../../types/acervos";
import type { SchoolResponse } from "../../../types/schools";
import { Modal } from "../../../shared/ui";
import { AcervosForm } from "./AcervosForm";

type AcervoFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertAcervoRequest;
  isNameInvalid: boolean;
  isSchoolInvalid: boolean;
  isFormInvalid: boolean;
  saving: boolean;
  error: string;
  schoolOptions: SchoolResponse[];
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
  isSchoolInvalid,
  isFormInvalid,
  saving,
  error,
  schoolOptions,
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
          : "Informe a escola e o nome para organizar livros e usuarios por biblioteca."
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
          isSchoolInvalid={isSchoolInvalid}
          isFormInvalid={isFormInvalid}
          schoolOptions={schoolOptions}
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
