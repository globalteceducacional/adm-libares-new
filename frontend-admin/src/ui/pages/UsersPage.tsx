import { motion } from "framer-motion";
import { Pencil, Plus, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  createUser,
  deleteUser,
  updateUserAcervo,
  updateUserProfile,
  updateUserStatus
} from "../../services/usersService";
import {
  getQueryErrorMessage,
  useAcervoOptionsQuery,
  useInvalidateAdminQueries,
  useSchoolsQuery,
  useUsersQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { useAuth } from "../../features/auth/AuthContext";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { SearchableSelect } from "../components/form/SearchableSelect";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import {
  type CreateUserFormState,
  toCreateUserRequest,
  toUpdateUserProfileRequest
} from "../components/users/UsersForm";
import { UserDetailModal } from "../components/users/UserDetailModal";
import { UserFormModal } from "../components/users/UserFormModal";
import { LegacyImage } from "../components/LegacyImage";
import type { UserResponse } from "../../types/users";
import { Alert, Button, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: CreateUserFormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  acervoId: "",
  status: "1"
};

type SaveUserVariables = {
  editingId: number | null;
  form: CreateUserFormState;
};

type SaveAcervoVariables = {
  user: UserResponse;
  acervoId: number;
};

export function UsersPage() {
  const location = useLocation();
  const { requiresSchoolContext, schoolContextId } = useAuth();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const [acervoFilter, setAcervoFilter] = useState<string>("all");
  const selectedAcervoId = acervoFilter === "all" ? undefined : Number(acervoFilter);
  const usersQuery = useUsersQuery(selectedAcervoId);
  const acervosQuery = useAcervoOptionsQuery();
  const schoolsQuery = useSchoolsQuery();
  const invalidate = useInvalidateAdminQueries();
  const users = usersQuery.data ?? [];
  const acervoOptions = acervosQuery.data ?? [];
  const loading = usersQuery.isLoading;
  const listingError = usersQuery.error
    ? getQueryErrorMessage(usersQuery.error, "Falha ao carregar usuarios")
    : acervosQuery.error
      ? getQueryErrorMessage(acervosQuery.error, "Falha ao carregar acervos")
      : schoolsQuery.error
        ? getQueryErrorMessage(schoolsQuery.error, "Falha ao carregar escolas")
        : undefined;
  const [formError, setFormError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<CreateUserFormState>(EMPTY_FORM);
  const canCreateUser = usePermission("users.create");
  const canUpdateUser = usePermission("users.update");
  const canBlockUser = usePermission("users.block");
  const canDeleteUser = usePermission("users.delete");
  const needsSchoolContext = requiresSchoolContext && !schoolContextId;

  const schoolLabel = useMemo(() => {
    if (!schoolContextId) {
      return null;
    }
    const school = schoolsQuery.data?.find((item) => item.id === schoolContextId);
    return school ? decodeHtmlEntities(school.name) : `Escola #${schoolContextId}`;
  }, [schoolContextId, schoolsQuery.data]);

  const acervoFilterOptions = useMemo(
    () => [
      { value: "all", label: "Todos os acervos" },
      ...acervoOptions.map((acervo) => ({
        value: String(acervo.id),
        label: decodeHtmlEntities(acervo.name)
      }))
    ],
    [acervoOptions]
  );

  const isFormInvalid = editingId
    ? form.name.trim().length === 0 ||
      form.email.trim().length === 0 ||
      form.phone.trim().length === 0
    : form.name.trim().length === 0 ||
      form.email.trim().length === 0 ||
      form.password.length < 6 ||
      form.phone.trim().length === 0 ||
      !form.acervoId ||
      Number.isNaN(Number(form.acervoId));

  async function invalidateUserQueries() {
    await invalidate.users();
  }

  const saveMutation = useAdminMutation<UserResponse, SaveUserVariables>({
    mutationFn: async ({ editingId: id, form: formState }) =>
      id
        ? updateUserProfile(id, toUpdateUserProfileRequest(formState))
        : createUser(toCreateUserRequest(formState)),
    successMessage: (_data, { editingId: id }) =>
      id ? "Perfil do usuario atualizado com sucesso." : "Usuario criado com sucesso.",
    errorFallback: "Falha ao salvar usuario",
    toastError: false,
    invalidate: invalidateUserQueries,
    onSuccess: () => {
      closeFormModal();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const statusMutation = useAdminMutation<UserResponse, UserResponse>({
    mutationFn: (user) => {
      const nextStatus = user.status === "0" ? "1" : "0";
      return updateUserStatus(user.id, { status: nextStatus });
    },
    successMessage: (_data, user) =>
      user.status === "0" ? "Usuario ativado com sucesso." : "Usuario desativado com sucesso.",
    errorFallback: "Falha ao atualizar status",
    invalidate: invalidateUserQueries
  });

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: (userId) => deleteUser(userId),
    successMessage: "Usuario excluido com sucesso.",
    errorFallback: "Falha ao excluir usuario",
    invalidate: invalidateUserQueries,
    onSuccess: (_data, userId) => {
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      if (editingId === userId) {
        closeFormModal();
      }
      setConfirmDeleteId(null);
    },
    onError: () => {
      setConfirmDeleteId(null);
    }
  });

  const acervoMutation = useAdminMutation<UserResponse, SaveAcervoVariables>({
    mutationFn: ({ user, acervoId }) => updateUserAcervo(user.id, { acervoId }),
    successMessage: "Acervo do usuario atualizado com sucesso.",
    errorFallback: "Falha ao atualizar acervo",
    toastError: false,
    invalidate: async () => {
      await invalidate.users();
      await invalidate.acervos();
    }
  });

  const saving =
    saveMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending ||
    acervoMutation.isPending;

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function closeFormModal() {
    resetForm();
    setFormError("");
    setFormModalOpen(false);
  }

  function openCreateForm() {
    resetForm();
    setFormError("");
    setFormModalOpen(true);
  }

  function handleEdit(user: UserResponse) {
    setSelectedUser(null);
    setEditingId(user.id);
    setFormError("");
    setForm({
      name: decodeHtmlEntities(user.name),
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      acervoId: user.acervoId ? String(user.acervoId) : "",
      status: user.status || "1"
    });
    setFormModalOpen(true);
  }

  useEffect(() => {
    setSelectedUser((current) => {
      if (!current) {
        return null;
      }
      return users.find((user) => user.id === current.id) ?? null;
    });
  }, [users]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId) {
      if (!canUpdateUser) {
        return;
      }
    } else if (!canCreateUser || needsSchoolContext) {
      return;
    }
    if (isFormInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    try {
      await saveMutation.mutateAsync({ editingId, form });
    } catch {
      // Erro ja tratado em onError do useAdminMutation (formError).
    }
  }

  async function handleSaveAcervo(user: UserResponse, acervoId: number) {
    await acervoMutation.mutateAsync({ user, acervoId });
  }

  function handleToggleStatus(user: UserResponse) {
    statusMutation.mutate(user);
  }

  function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    deleteMutation.mutate(confirmDeleteId);
  }

  const columns = useMemo<DataTableColumn<UserResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (user) => user.id },
      {
        key: "photo",
        label: "Foto",
        render: (user) => (
          <LegacyImage
            legacyPath={user.userImage}
            folder="images"
            alt={`Avatar de ${decodeHtmlEntities(user.name)}`}
            className="table-avatar"
            fallbackClassName="table-avatar-placeholder"
            fallbackText={decodeHtmlEntities(user.name).charAt(0).toUpperCase()}
          />
        )
      },
      { key: "name", label: "Nome", render: (user) => decodeHtmlEntities(user.name) },
      { key: "email", label: "Email", render: (user) => user.email },
      { key: "phone", label: "Telefone", render: (user) => user.phone || "-" },
      { key: "type", label: "Tipo", render: (user) => user.userType },
      {
        key: "acervo",
        label: "Acervo",
        render: (user) =>
          user.acervoName ? (
            decodeHtmlEntities(user.acervoName)
          ) : (
            <span className="warning-text">Sem acervo</span>
          )
      },
      {
        key: "status",
        label: "Status",
        render: (user) => <StatusBadge active={user.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (user) => (
          <TableRowActions>
            {canUpdateUser ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(user)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {(user.status === "1" ? canBlockUser : canUpdateUser) ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleToggleStatus(user)}
                disabled={saving}
              >
                {user.status === "1" ? <UserX size={14} /> : <UserCheck size={14} />}
                {user.status === "1" ? "Desativar" : "Ativar"}
              </motion.button>
            ) : null}
            {canDeleteUser ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(user.id)}
                disabled={saving}
                aria-label={`Excluir o usuario ${decodeHtmlEntities(user.name)}`}
              >
                <Trash2 size={14} />
                Excluir
              </motion.button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [saving, canUpdateUser, canBlockUser, canDeleteUser]
  );

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return users.filter((user) => {
      const byStatus = statusFilter === "all" || user.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(user.name).toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        String(user.id).includes(normalized);
      return byStatus && byText;
    });
  }, [users, search, statusFilter]);

  const emptyMessage = useMemo(
    () =>
      `Nenhum usuario encontrado para os filtros aplicados.${
        search || statusFilter !== "all" ? " Limpe os filtros para ver mais resultados." : ""
      }`,
    [search, statusFilter]
  );

  const listStats = useMemo(() => {
    const active = users.filter((user) => user.status === "1").length;
    return [
      { label: "Total cadastrados", value: users.length },
      { label: "Ativos", value: active },
      { label: "Inativos", value: users.length - active },
      {
        label: "Exibidos agora",
        value: filteredUsers.length,
        hint: "Com filtros aplicados"
      }
    ];
  }, [users, filteredUsers]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Users}
          title="Usuarios do app"
          description="Gerencie leitores do aplicativo, status de acesso e vinculo com acervos."
          tone="info"
          actions={
            canCreateUser ? (
              <PermissionGate permission="users.create">
                <Button type="button" onClick={openCreateForm} disabled={saving}>
                  <Plus size={16} />
                  Novo usuario
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
          Selecione uma escola no topo do painel para criar usuarios.
        </Alert>
      ) : null}

      <AdminListingSection<UserResponse>
        title="Lista de leitores"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, email ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        secondaryFilter={
          <SearchableSelect
            label="Acervo"
            compact
            options={acervoFilterOptions}
            value={acervoFilter}
            onChange={setAcervoFilter}
            placeholder="Todos os acervos"
            searchPlaceholder="Buscar acervo..."
            emptyMessage="Nenhum acervo disponivel."
          />
        }
        columns={columns}
        data={filteredUsers}
        loading={loading}
        keyExtractor={(user) => user.id}
        emptyMessage={emptyMessage}
        countLabel={`${filteredUsers.length} usuario(s) com o filtro atual`}
        error={listingError}
        onRowClick={setSelectedUser}
        renderMobileCard={(user) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={user.userImage}
                folder="images"
                alt={`Avatar de ${decodeHtmlEntities(user.name)}`}
                className="table-avatar"
                fallbackClassName="table-avatar-placeholder"
                fallbackText={decodeHtmlEntities(user.name).charAt(0).toUpperCase()}
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{user.id}</p>
              <h3>{decodeHtmlEntities(user.name)}</h3>
              <p className="book-card-author">{user.email}</p>
              <p className="book-card-author">
                {user.acervoName ? decodeHtmlEntities(user.acervoName) : "Sem acervo"}
              </p>
              <StatusBadge active={user.status === "1"} />
            </div>
            <div
              className="book-card-actions"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <TableRowActions>
                {canUpdateUser ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="table-btn icon"
                    type="button"
                    onClick={() => handleEdit(user)}
                    disabled={saving}
                  >
                    <Pencil size={14} />
                    Editar
                  </motion.button>
                ) : null}
                {(user.status === "1" ? canBlockUser : canUpdateUser) ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="table-btn icon"
                    type="button"
                    onClick={() => handleToggleStatus(user)}
                    disabled={saving}
                  >
                    {user.status === "1" ? <UserX size={14} /> : <UserCheck size={14} />}
                    {user.status === "1" ? "Desativar" : "Ativar"}
                  </motion.button>
                ) : null}
                {canDeleteUser ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="table-btn danger icon"
                    type="button"
                    onClick={() => setConfirmDeleteId(user.id)}
                    disabled={saving}
                    aria-label={`Excluir o usuario ${decodeHtmlEntities(user.name)}`}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </motion.button>
                ) : null}
              </TableRowActions>
            </div>
          </article>
        )}
      />

      <UserFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        saving={saving}
        error={formError}
        needsSchoolContext={needsSchoolContext}
        isFormInvalid={isFormInvalid}
        schoolLabel={schoolLabel}
        acervoOptions={acervoOptions}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
      />

      <UserDetailModal
        user={selectedUser}
        open={selectedUser !== null}
        saving={saving}
        acervoOptions={acervoOptions}
        onClose={() => setSelectedUser(null)}
        onEdit={canUpdateUser ? handleEdit : undefined}
        onToggleStatus={
          selectedUser && (selectedUser.status === "1" ? canBlockUser : canUpdateUser)
            ? handleToggleStatus
            : undefined
        }
        onDelete={canDeleteUser ? (user) => setConfirmDeleteId(user.id) : undefined}
        onSaveAcervo={handleSaveAcervo}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir usuario"
        description="Esta acao nao pode ser desfeita. Deseja realmente excluir este usuario?"
        confirmLabel="Excluir"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
