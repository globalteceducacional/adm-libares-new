import type { FormEvent } from "react";
import type { UpsertSchoolRequest } from "../../../types/schools";
import { Modal } from "../../../shared/ui";
import { SchoolsForm } from "./SchoolsForm";

type SchoolFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertSchoolRequest;
  isNameInvalid: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertSchoolRequest) => void;
};

export function SchoolFormModal({
  open,
  editingId,
  form,
  isNameInvalid,
  saving,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange
}: SchoolFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar escola" : "Nova escola"}
      description={
        editingId
          ? `Atualize os dados da escola #${editingId}.`
          : "Defina nome, slug e status para isolar dados por tenant."
      }
      size="lg"
      className="max-w-2xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <SchoolsForm
          form={form}
          editingId={editingId}
          saving={saving}
          isNameInvalid={isNameInvalid}
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
