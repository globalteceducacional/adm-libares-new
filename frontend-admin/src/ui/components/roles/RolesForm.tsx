import type { FormEvent } from "react";
import type { UpsertRoleRequest } from "../../../types/roles";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";

type PermissionItem = {
  id: string;
  label: string;
  description: string;
};

type RolesFormProps = {
  form: UpsertRoleRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  isPermissionsInvalid: boolean;
  isEditingSystemRole: boolean;
  needsSchoolContext: boolean;
  canSubmit: boolean;
  permissionItems: PermissionItem[];
  canManageRoles: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertRoleRequest) => void;
  onTogglePermission: (code: string) => void;
};

export function RolesForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  isPermissionsInvalid,
  isEditingSystemRole,
  needsSchoolContext,
  canSubmit,
  permissionItems,
  canManageRoles,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onTogglePermission
}: RolesFormProps) {
  const fieldsDisabled = isEditingSystemRole || needsSchoolContext;

  return (
    <FormGrid onSubmit={onSubmit}>
      <Field
        label="Nome"
        required
        error={isNameInvalid ? "Informe um nome valido." : undefined}
      >
        <Input
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={fieldsDisabled}
          invalid={isNameInvalid}
        />
      </Field>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={fieldsDisabled}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Select>
      </Field>

      <FormFullWidth>
        <p className="mb-2 text-sm font-medium text-foreground">Permissoes</p>
        <SearchableCheckboxList
          items={permissionItems}
          selectedIds={form.permissionCodes}
          onToggle={onTogglePermission}
          searchPlaceholder="Buscar permissão por código ou módulo..."
          tall
          disabled={fieldsDisabled || !canManageRoles}
          emptyMessage="Nenhuma permissão disponível."
        />
        {isPermissionsInvalid ? (
          <p className="mt-2 text-xs text-danger" role="alert">
            Selecione ao menos uma permissão.
          </p>
        ) : null}
      </FormFullWidth>

      <FormActions>
        {canSubmit ? (
          <Button type="submit" disabled={saving || needsSchoolContext || isNameInvalid}>
            {saving ? "Salvando..." : editingId ? "Salvar perfil" : "Criar perfil"}
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {isEditingSystemRole ? "Fechar" : inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
