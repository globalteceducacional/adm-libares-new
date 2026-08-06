import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { UpsertRoleRequest } from "../../../types/roles";
import { BerrySelect } from "../layout/BerrySelect";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";
import { Field, Input } from "../../../shared/ui";

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
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nome"
          required
          error={isNameInvalid ? "Informe um nome valido." : undefined}
        >
          <Input
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            disabled={fieldsDisabled}
            required
            invalid={isNameInvalid}
          />
        </Field>
        <BerrySelect
          label="Status"
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={fieldsDisabled}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </BerrySelect>
      </div>

      <fieldset className="form-field acervo-fieldset">
        <legend>Permissoes</legend>
        <SearchableCheckboxList
          items={permissionItems}
          selectedIds={form.permissionCodes}
          onToggle={onTogglePermission}
          searchPlaceholder="Buscar permissao por codigo ou modulo..."
          tall
          disabled={fieldsDisabled || !canManageRoles}
          emptyMessage="Nenhuma permissao disponivel."
        />
        {isPermissionsInvalid ? (
          <small className="warning-text">Selecione ao menos uma permissao.</small>
        ) : null}
      </fieldset>

      <div className="book-form-actions">
        {canSubmit ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="primary-btn"
            type="submit"
            disabled={saving || needsSchoolContext}
          >
            {saving ? "Salvando..." : editingId ? "Salvar perfil" : "Criar perfil"}
          </motion.button>
        ) : null}
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal
            ? isEditingSystemRole
              ? "Fechar"
              : "Cancelar"
            : isEditingSystemRole
              ? "Fechar"
              : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
