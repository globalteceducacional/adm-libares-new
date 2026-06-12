import { motion } from "framer-motion";
import { Trash2, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteUser, updateUserStatus } from "../../services/usersService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useUsersQuery
} from "../../features/shared/api/queries";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { LegacyImage } from "../components/LegacyImage";
import type { UserResponse } from "../../types/users";
import { ConfirmDialog, StatusBadge } from "../../shared/ui";
import { type DataTableColumn } from "../components/table/DataTable";

export function UsersPage() {
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const usersQuery = useUsersQuery();
  const invalidate = useInvalidateAdminQueries();
  const users = usersQuery.data ?? [];
  const loading = usersQuery.isLoading;
  const queryError = usersQuery.error
    ? getQueryErrorMessage(usersQuery.error, "Falha ao carregar usuarios")
    : undefined;
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const error = actionError || queryError;

  async function handleToggleStatus(user: UserResponse) {
    setActionError("");
    clearSuccess();
    setSaving(true);
    try {
      const nextStatus = user.status === "0" ? "1" : "0";
      await updateUserStatus(user.id, { status: nextStatus });
      showSuccess(nextStatus === "1" ? "Usuario ativado com sucesso." : "Usuario desativado com sucesso.");
      await invalidate.users();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Falha ao atualizar status";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const userId = confirmDeleteId;
    setActionError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteUser(userId);
      showSuccess("Usuario excluido com sucesso.");
      await invalidate.users();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Falha ao excluir usuario";
      setActionError(message);
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
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
            alt={`Avatar de ${user.name}`}
            className="table-avatar"
            fallbackClassName="table-avatar-placeholder"
            fallbackText={user.name.charAt(0).toUpperCase()}
          />
        )
      },
      { key: "name", label: "Nome", render: (user) => user.name },
      { key: "email", label: "Email", render: (user) => user.email },
      { key: "phone", label: "Telefone", render: (user) => user.phone || "-" },
      { key: "type", label: "Tipo", render: (user) => user.userType },
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
          <>
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
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="table-btn danger icon"
              type="button"
              onClick={() => setConfirmDeleteId(user.id)}
              disabled={saving}
              aria-label={`Excluir o usuario ${user.name}`}
            >
              <Trash2 size={14} />
              Excluir
            </motion.button>
          </>
        )
      }
    ],
    [saving]
  );

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return users.filter((user) => {
      const byStatus = statusFilter === "all" || user.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        user.name.toLowerCase().includes(normalized) ||
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

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <AdminListingSection<UserResponse>
        title="Gestao de Usuarios"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, email ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredUsers}
        loading={loading}
        keyExtractor={(user) => user.id}
        emptyMessage={emptyMessage}
        countLabel={`${filteredUsers.length} usuario(s) com o filtro atual`}
        error={error}
        success={success}
        renderMobileCard={(user) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={user.userImage}
                folder="images"
                alt={`Avatar de ${user.name}`}
                className="table-avatar"
                fallbackClassName="table-avatar-placeholder"
                fallbackText={user.name.charAt(0).toUpperCase()}
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{user.id}</p>
              <h3>{user.name}</h3>
              <p className="book-card-author">{user.email}</p>
              <StatusBadge active={user.status === "1"} />
            </div>
            <div className="book-card-actions">
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
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(user.id)}
                disabled={saving}
                aria-label={`Excluir o usuario ${user.name}`}
              >
                <Trash2 size={14} />
                Excluir
              </motion.button>
            </div>
          </article>
        )}
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
    </motion.section>
  );
}
