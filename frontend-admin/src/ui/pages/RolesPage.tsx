import { motion } from "framer-motion";
import { Pencil, Power, Shield, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createRole, deleteRole, updateRole } from "../../services/rolesService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  usePermissionsQuery,
  useRolesQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { useAuth } from "../../features/auth/AuthContext";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { useAnyPermission, usePermission } from "../../features/auth/usePermission";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { BerrySelect } from "../components/layout/BerrySelect";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { RoleResponse, UpsertRoleRequest } from "../../types/roles";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Badge, Button, ConfirmDialog, Field, Input, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { SearchableCheckboxList } from "../components/form/SearchableCheckboxList";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_ROLE_FORM: UpsertRoleRequest = {
  name: "",
  status: "1",
  permissionCodes: []
};

export function RolesPage() {
  const location = useLocation();
  const { requiresSchoolContext, schoolContextId } = useAuth();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const rolesQuery = useRolesQuery();
  const permissionsQuery = usePermissionsQuery();
  const invalidate = useInvalidateAdminQueries();

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const loading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const listingError = rolesQuery.error
    ? getQueryErrorMessage(rolesQuery.error, "Falha ao carregar perfis")
    : permissionsQuery.error
      ? getQueryErrorMessage(permissionsQuery.error, "Falha ao carregar permissoes")
      : undefined;

  const [formError, setFormError] = useState("");
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertRoleRequest>(EMPTY_ROLE_FORM);
  // Erros de campo so apos tentativa de salvar.
  const [showValidation, setShowValidation] = useState(false);

  const canCreate = usePermission("roles.create");
  const canUpdate = usePermission("roles.update");
  const canDelete = usePermission("roles.delete");
  const canManageRoles = useAnyPermission(["roles.create", "roles.update"]);

  const needsSchoolContext = requiresSchoolContext && !schoolContextId;
  const editingRole = editingId ? roles.find((role) => role.id === editingId) : null;
  const isEditingSystemRole = editingRole?.isSystem ?? false;
  const isNameInvalid = form.name.trim().length === 0;
  const isPermissionsInvalid = form.permissionCodes.length === 0;
  const isFormInvalid = isNameInvalid || isPermissionsInvalid;

  const permissionItems = useMemo(
    () =>
      [...permissions]
        .sort((a, b) => {
          const moduleCmp = a.module.localeCompare(b.module, "pt-BR");
          if (moduleCmp !== 0) {
            return moduleCmp;
          }
          return a.code.localeCompare(b.code, "pt-BR");
        })
        .map((permission) => ({
          id: permission.code,
          label: permission.code,
          description: `${permission.module} — ${permission.description}`
        })),
    [permissions]
  );

  function resetForm() {
    setForm(EMPTY_ROLE_FORM);
    setEditingId(null);
    setShowValidation(false);
    setFormError("");
  }

  function togglePermission(code: string) {
    setForm((current) => {
      const exists = current.permissionCodes.includes(code);
      return {
        ...current,
        permissionCodes: exists
          ? current.permissionCodes.filter((item) => item !== code)
          : [...current.permissionCodes, code]
      };
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (needsSchoolContext || isEditingSystemRole) {
      return;
    }
    setShowValidation(true);
    if (isFormInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const payload: UpsertRoleRequest = {
        name: form.name.trim(),
        status: form.status,
        permissionCodes: form.permissionCodes
      };

      if (editingId) {
        await updateRole(editingId, payload);
        resetForm();
        showToast("Perfil atualizado com sucesso.", "success");
      } else {
        await createRole(payload);
        resetForm();
        showToast("Perfil criado com sucesso.", "success");
      }

      await invalidate.roles();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(role: RoleResponse) {
    setEditingId(role.id);
    setShowValidation(false);
    setFormError("");
    setForm({
      name: decodeHtmlEntities(role.name),
      status: role.status,
      permissionCodes: [...role.permissionCodes]
    });
    document.getElementById("role-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(role: RoleResponse) {
    if (!canUpdate || role.isSystem) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateRole(role.id, {
        name: role.name,
        status: "1",
        permissionCodes: [...role.permissionCodes]
      });
      showToast("Perfil ativado com sucesso.", "success");
      await invalidate.roles();
    } catch (activateError) {
      const message =
        activateError instanceof Error ? activateError.message : "Falha ao ativar perfil";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const roleId = confirmDeleteId;
    setFormError("");
    setSaving(true);
    try {
      await deleteRole(roleId);
      if (editingId === roleId) {
        resetForm();
      }
      showToast("Perfil desativado com sucesso.", "success");
      await invalidate.roles();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar perfil");
      showToast(
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar perfil",
        "error"
      );
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
  }

  const filteredRoles = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return roles.filter((role) => {
      const byStatus = statusFilter === "all" || role.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(role.name).toLowerCase().includes(normalized) ||
        String(role.id).includes(normalized);
      return byStatus && byText;
    });
  }, [roles, search, statusFilter]);

  const columns: DataTableColumn<RoleResponse>[] = useMemo(
    () => [
      { key: "id", label: "ID", render: (role) => role.id },
      {
        key: "name",
        label: "Nome",
        render: (role) => (
          <span className="inline-flex items-center gap-2">
            {decodeHtmlEntities(role.name)}
            {role.isSystem ? <Badge tone="muted">Sistema</Badge> : null}
          </span>
        )
      },
      {
        key: "permissions",
        label: "Permissoes",
        render: (role) => `${role.permissionCodes.length} permissao(oes)`
      },
      {
        key: "status",
        label: "Status",
        render: (role) => <StatusBadge active={role.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (role) => (
          <TableRowActions>
            {canUpdate ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(role)}
                disabled={saving}
              >
                <Pencil size={14} />
                {role.isSystem ? "Ver" : "Editar"}
              </motion.button>
            ) : null}
            {canUpdate && !role.isSystem && role.status !== "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleActivate(role)}
                disabled={saving}
              >
                <Power size={14} />
                Ativar
              </motion.button>
            ) : null}
            {canDelete && !role.isSystem && role.status === "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(role.id)}
                disabled={saving}
              >
                <Trash2 size={14} />
                Desativar
              </motion.button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [saving, canUpdate, canDelete]
  );

  const listStats = useMemo(() => {
    const active = roles.filter((role) => role.status === "1").length;
    const systemRoles = roles.filter((role) => role.isSystem).length;
    return [
      { label: "Total de perfis", value: roles.length },
      { label: "Ativos", value: active },
      { label: "De sistema", value: systemRoles },
      {
        label: "Exibidos agora",
        value: filteredRoles.length,
        hint: `${permissions.length} permissoes disponiveis`
      }
    ];
  }, [roles, filteredRoles, permissions.length]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Shield}
          title="Perfis e permissoes"
          description="Gerencie perfis de acesso da escola com permissoes granulares."
          tone="primary"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
        {needsSchoolContext ? (
          <Alert tone="warning">
            Selecione uma escola no topo do painel para gerenciar perfis como Super Admin.
          </Alert>
        ) : null}

        <PermissionGate anyOf={["roles.create", "roles.update"]}>
          <BerryFormPanel
            id="role-form-section"
            icon={Shield}
            title={
              isEditingSystemRole
                ? "Perfil de sistema (somente leitura)"
                : editingId
                  ? "Editar perfil"
                  : "Cadastrar novo perfil"
            }
            description="Combine permissoes por modulo para controlar o acesso dos usuarios."
          >
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Nome"
                    required
                    error={showValidation && isNameInvalid ? "Informe um nome valido." : undefined}
                  >
                    <Input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      disabled={isEditingSystemRole || needsSchoolContext}
                      required
                      invalid={showValidation && isNameInvalid}
                    />
                  </Field>
                  <BerrySelect
                    label="Status"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                    disabled={isEditingSystemRole || needsSchoolContext}
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
                    onToggle={togglePermission}
                    searchPlaceholder="Buscar permissao por codigo ou modulo..."
                    tall
                    disabled={isEditingSystemRole || needsSchoolContext || !canManageRoles}
                    emptyMessage="Nenhuma permissao disponivel."
                  />
                  {showValidation && isPermissionsInvalid ? (
                    <small className="warning-text">Selecione ao menos uma permissao.</small>
                  ) : null}
                </fieldset>

                <div className="flex gap-2">
                  {!isEditingSystemRole && (editingId ? canUpdate : canCreate) ? (
                    <Button type="submit" disabled={saving || needsSchoolContext}>
                      {editingId ? "Salvar perfil" : "Criar perfil"}
                    </Button>
                  ) : null}
                  {editingId ? (
                    <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                      {isEditingSystemRole ? "Fechar" : "Cancelar edicao"}
                    </Button>
                  ) : null}
                </div>
              </form>

              {formError ? (
                <Alert tone="danger" className="mt-3">
                  {formError}
                </Alert>
              ) : null}
          </BerryFormPanel>
        </PermissionGate>

        <AdminListingSection<RoleResponse>
          title="Listagem de perfis"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nome ou ID"
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          columns={columns}
          data={filteredRoles}
          loading={loading}
          keyExtractor={(role) => role.id}
          emptyMessage="Nenhum perfil encontrado."
          countLabel={`${filteredRoles.length} perfil(is) com o filtro atual`}
          error={listingError}
        />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar perfil"
        description="O perfil sera marcado como inativo. Deseja continuar?"
        confirmLabel="Desativar"
        tone="danger"
        loading={saving}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </ListingPageShell>
  );
}
