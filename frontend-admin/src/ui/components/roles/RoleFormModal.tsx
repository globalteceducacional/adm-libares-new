import type { FormEvent } from "react";
import type { UpsertRoleRequest } from "../../../types/roles";
import { Modal } from "../../../shared/ui";
import { RolesForm } from "./RolesForm";

type PermissionItem = {
  id: string;
  label: string;
  description: string;
};

type RoleFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertRoleRequest;
  isNameInvalid: boolean;
  isPermissionsInvalid: boolean;
  isEditingSystemRole: boolean;
  needsSchoolContext: boolean;
  canSubmit: boolean;
  canManageRoles: boolean;
  permissionItems: PermissionItem[];
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertRoleRequest) => void;
  onTogglePermission: (code: string) => void;
};

export function RoleFormModal(props: RoleFormModalProps) {
  const {
    open,
    editingId,
    isEditingSystemRole,
    saving,
    error,
    onClose,
    onSubmit,
    onReset,
    onFormChange,
    onTogglePermission,
    ...formProps
  } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditingSystemRole
          ? "Perfil de sistema (somente leitura)"
          : editingId
            ? "Editar perfil"
            : "Novo perfil"
      }
      description="Combine permissoes por modulo para controlar o acesso dos usuarios."
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <RolesForm
          editingId={editingId}
          isEditingSystemRole={isEditingSystemRole}
          saving={saving}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onTogglePermission={onTogglePermission}
          {...formProps}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
