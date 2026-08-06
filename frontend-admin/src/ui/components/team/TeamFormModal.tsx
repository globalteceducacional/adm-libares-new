import type { FormEvent } from "react";
import type { SchoolResponse } from "../../../types/schools";
import { Modal } from "../../../shared/ui";
import {
  CreateTeamMemberForm,
  type CreateTeamMemberFormState
} from "./CreateTeamMemberForm";

type TeamFormModalProps = {
  open: boolean;
  form: CreateTeamMemberFormState;
  saving: boolean;
  isSuperAdmin: boolean;
  needsSchoolContext: boolean;
  isFormInvalid: boolean;
  schoolOptions: SchoolResponse[];
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: CreateTeamMemberFormState) => void;
};

export function TeamFormModal({
  open,
  form,
  saving,
  isSuperAdmin,
  needsSchoolContext,
  isFormInvalid,
  schoolOptions,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange
}: TeamFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo membro da equipe"
      description="Crie contas de admin da escola ou professor para acesso ao painel."
      size="lg"
      className="max-w-2xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <CreateTeamMemberForm
          form={form}
          saving={saving}
          isSuperAdmin={isSuperAdmin}
          needsSchoolContext={needsSchoolContext}
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
