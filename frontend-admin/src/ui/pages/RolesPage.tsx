import { motion } from "framer-motion";
import { Pencil, Plus, Power, Shield, Trash2 } from "lucide-react";
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
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { RoleFormModal } from "../components/roles/RoleFormModal";
import type { RoleResponse, UpsertRoleRequest } from "../../types/roles";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { Alert, Badge, Button, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_ROLE_FORM: UpsertRoleRequest = {
  name: "",
  status: "1",
  permissionCodes: []
};

type SaveRoleVariables = {
  editingId: number | null;
  payload: UpsertRoleRequest;
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
  const [formModalOpen, setFormModalOpen] = useState(false);
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
  const canSubmit = !isEditingSystemRole && (editingId ? canUpdate : canCreate);

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

  async function invalidateRoleQueries() {
    await invalidate.roles();
  }

  const saveMutation = useAdminMutation<RoleResponse, SaveRoleVariables>({
    mutationFn: async ({ editingId: id, payload }) =>
      id ? updateRole(id, payload) : createRole(payload),
    successMessage: (_data, { editingId: id }) =>
      id ? "Perfil atualizado com sucesso." : "Perfil criado com sucesso.",
    errorFallback: "Falha ao salvar perfil",
    toastError: false,
    invalidate: invalidateRoleQueries,
    onSuccess: () => {
      closeFormModal();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const activateMutation = useAdminMutation<RoleResponse, RoleResponse>({
    mutationFn: (role) =>
      updateRole(role.id, {
        name: role.name,
        status: "1",
        permissionCodes: [...role.permissionCodes]
      }),
    successMessage: "Perfil ativado com sucesso.",
    errorFallback: "Falha ao ativar perfil",
    invalidate: invalidateRoleQueries,
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: (roleId) => deleteRole(roleId),
    successMessage: "Perfil desativado com sucesso.",
    errorFallback: "Falha ao desativar perfil",
    invalidate: invalidateRoleQueries,
    onSuccess: (_data, roleId) => {
      if (editingId === roleId) {
        closeFormModal();
      }
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      setFormError(error.message);
      setConfirmDeleteId(null);
    }
  });

  const saving =
    saveMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

  function resetForm() {
    setForm(EMPTY_ROLE_FORM);
    setEditingId(null);
    setShowValidation(false);
  }

  function closeFormModal() {
    resetForm();
    setFormError("");
    setFormModalOpen(false);
  }

  function openCreateForm() {
    if (needsSchoolContext) {
      return;
    }
    resetForm();
    setFormError("");
    setFormModalOpen(true);
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
    if (!canSubmit || needsSchoolContext || isEditingSystemRole) {
      return;
    }
    setShowValidation(true);
    if (isFormInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }

    setFormError("");
    try {
      await saveMutation.mutateAsync({
        editingId,
        payload: {
          name: form.name.trim(),
          status: form.status,
          permissionCodes: form.permissionCodes
        }
      });
    } catch {
      // Erro ja tratado em onError do useAdminMutation (formError).
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
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  function handleActivate(role: RoleResponse) {
    if (!canUpdate || role.isSystem) {
      return;
    }
    setFormError("");
    activateMutation.mutate(role);
  }

  function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    setFormError("");
    deleteMutation.mutate(confirmDeleteId);
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
          actions={
            canCreate ? (
              <PermissionGate anyOf={["roles.create"]}>
                <Button
                  type="button"
                  onClick={openCreateForm}
                  disabled={saving || needsSchoolContext}
                  title={
                    needsSchoolContext
                      ? "Selecione uma escola no topo do painel"
                      : undefined
                  }
                >
                  <Plus size={16} />
                  Novo perfil
                </Button>
              </PermissionGate>
            ) : null
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {needsSchoolContext ? (
        <Alert tone="warning">
          Selecione uma escola no topo do painel para gerenciar perfis como Super Admin.
        </Alert>
      ) : null}

      {formError && !formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {formError}
        </Alert>
      ) : null}

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

      <RoleFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isNameInvalid={showValidation && isNameInvalid}
        isPermissionsInvalid={showValidation && isPermissionsInvalid}
        isEditingSystemRole={isEditingSystemRole}
        needsSchoolContext={needsSchoolContext}
        canSubmit={canSubmit}
        canManageRoles={canManageRoles}
        permissionItems={permissionItems}
        saving={saving}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
        onTogglePermission={togglePermission}
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
