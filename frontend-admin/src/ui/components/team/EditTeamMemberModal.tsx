import type { FormEvent } from "react";
import { Alert, Button, Field, Modal } from "../../../shared/ui";
import type { TeamMemberResponse, UpdateTeamMemberRequest } from "../../../types/team";

type EditTeamMemberModalProps = {
  open: boolean;
  member: TeamMemberResponse | null;
  form: UpdateTeamMemberRequest;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onFormChange: (next: UpdateTeamMemberRequest) => void;
};

export function EditTeamMemberModal({
  open,
  member,
  form,
  saving,
  error,
  onClose,
  onSubmit,
  onFormChange
}: EditTeamMemberModalProps) {
  if (!member) {
    return null;
  }

  const isNameInvalid = form.name.trim().length === 0;
  const isPasswordInvalid =
    form.newPassword !== undefined &&
    form.newPassword.length > 0 &&
    form.newPassword.length < 6;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar membro #${member.id}`}
      description={`Altere o nome ou senha de ${member.username}.`}
      size="lg"
      className="max-w-lg"
      closeOnOverlayClick={!saving}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-team-member-form"
            disabled={saving || isNameInvalid || isPasswordInvalid}
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="edit-team-member-form" onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Nome"
          required
          error={isNameInvalid ? "Nome é obrigatório" : undefined}
        >
          <input
            className="form-input"
            type="text"
            value={form.name}
            maxLength={150}
            autoComplete="off"
            disabled={saving}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
          />
        </Field>

        <Field
          label="Nova senha (deixe em branco para não alterar)"
          error={isPasswordInvalid ? "Senha deve ter ao menos 6 caracteres" : undefined}
        >
          <input
            className="form-input"
            type="password"
            value={form.newPassword ?? ""}
            maxLength={100}
            autoComplete="new-password"
            disabled={saving}
            placeholder="Mínimo 6 caracteres"
            onChange={(e) =>
              onFormChange({
                ...form,
                newPassword: e.target.value || undefined
              })
            }
          />
        </Field>

        {error ? <Alert tone="danger">{error}</Alert> : null}
      </form>
    </Modal>
  );
}
