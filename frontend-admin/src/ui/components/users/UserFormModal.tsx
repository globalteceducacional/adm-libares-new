import type { FormEvent } from "react";
import type { AcervoOptionResponse } from "../../../types/acervos";
import { Modal } from "../../../shared/ui";
import { UsersForm, type CreateUserFormState } from "./UsersForm";

type UserFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: CreateUserFormState;
  saving: boolean;
  error: string;
  isFormInvalid: boolean;
  schoolLabel: string | null;
  acervoOptions: AcervoOptionResponse[];
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: CreateUserFormState) => void;
};

export function UserFormModal({
  open,
  editingId,
  form,
  saving,
  error,
  isFormInvalid,
  schoolLabel,
  acervoOptions,
  onClose,
  onSubmit,
  onReset,
  onFormChange
}: UserFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar usuario" : "Novo usuario"}
      description={
        editingId
          ? `Atualize o perfil #${editingId}.`
          : "Cadastre um leitor do aplicativo. A escola e definida pelo acervo escolhido."
      }
      size="lg"
      className="max-w-2xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <UsersForm
          mode={editingId ? "edit" : "create"}
          form={form}
          inModal
          saving={saving}
          isFormInvalid={isFormInvalid}
          schoolLabel={schoolLabel}
          acervoOptions={acervoOptions}
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
