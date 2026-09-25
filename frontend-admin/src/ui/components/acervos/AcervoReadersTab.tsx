import { motion } from "framer-motion";
import { Link2Off, Plus, UserCheck, Users, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePermission } from "../../../features/auth/usePermission";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useUsersQuery
} from "../../../features/shared/api/queries";
import { useAdminListFilters } from "../../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../../hooks/useAdminMutation";
import { updateUserAcervo, updateUserStatus } from "../../../services/usersService";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, ConfirmDialog, EmptyState, StatusBadge, useToast } from "../../../shared/ui";
import type { AcervoResponse } from "../../../types/acervos";
import type { UserResponse } from "../../../types/users";
import { AdminListingSection } from "../layout/AdminListingSection";
import { LegacyImage } from "../LegacyImage";
import type { DataTableColumn } from "../table/DataTable";
import { TableRowActions } from "../table/TableRowActions";
import { AddReadersToAcervoModal } from "./AddReadersToAcervoModal";

type AcervoReadersTabProps = {
  acervo: AcervoResponse;
};

type LinkReadersResult = {
  linked: number;
  failed: { name: string; message: string }[];
};

function formatLinkReport(result: LinkReadersResult): string {
  const base = `${result.linked} leitor(es) vinculado(s).`;
  if (result.failed.length === 0) {
    return base;
  }
  const names = result.failed.map((item) => `${item.name} (${item.message})`).join("; ");
  return `${base} ${result.failed.length} falharam: ${names}`;
}

export function AcervoReadersTab({ acervo }: AcervoReadersTabProps) {
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const usersQuery = useUsersQuery(acervo.id);
  const invalidate = useInvalidateAdminQueries();
  const { showToast } = useToast();
  const users = usersQuery.data ?? [];

  const canUpdateUser = usePermission("users.update");
  const canBlockUser = usePermission("users.block");
  const acervoActive = acervo.status === "1";

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [userToUnlink, setUserToUnlink] = useState<UserResponse | null>(null);
  const [unlinkError, setUnlinkError] = useState("");

  async function invalidateReaderQueries() {
    await invalidate.users();
    await invalidate.acervos();
  }

  // Sem endpoint bulk: vincula um a um (sequencial para nao saturar a API) e relata no fim.
  const linkMutation = useAdminMutation<LinkReadersResult, UserResponse[]>({
    mutationFn: async (selectedUsers) => {
      const result: LinkReadersResult = { linked: 0, failed: [] };
      setProgress({ done: 0, total: selectedUsers.length });
      for (const [index, user] of selectedUsers.entries()) {
        try {
          await updateUserAcervo(user.id, { acervoId: acervo.id });
          result.linked += 1;
        } catch (error) {
          result.failed.push({
            name: decodeHtmlEntities(user.name),
            message: error instanceof Error ? error.message : "erro desconhecido"
          });
        }
        setProgress({ done: index + 1, total: selectedUsers.length });
      }
      return result;
    },
    errorFallback: "Falha ao vincular leitores",
    toastError: false,
    invalidate: invalidateReaderQueries,
    onSuccess: (result) => {
      setProgress(null);
      // Toast so no sucesso total; com falhas parciais o relatorio fica no modal.
      if (result.failed.length === 0) {
        showToast(formatLinkReport(result), "success");
        setAddModalOpen(false);
        setAddError("");
      } else {
        setAddError(formatLinkReport(result));
      }
    },
    onError: (error) => {
      setProgress(null);
      setAddError(error.message);
    }
  });

  const unlinkMutation = useAdminMutation<UserResponse, UserResponse>({
    mutationFn: (user) => updateUserAcervo(user.id, { acervoId: null }),
    successMessage: "Leitor desvinculado. Ele nao vera livros ate receber outro acervo.",
    errorFallback: "Falha ao desvincular leitor",
    toastError: false,
    invalidate: invalidateReaderQueries,
    onSuccess: () => setUserToUnlink(null),
    onError: (error) => {
      setUnlinkError(error.message);
      setUserToUnlink(null);
    }
  });

  const statusMutation = useAdminMutation<UserResponse, UserResponse>({
    mutationFn: (user) => updateUserStatus(user.id, { status: user.status === "0" ? "1" : "0" }),
    successMessage: (_data, user) =>
      user.status === "0" ? "Leitor ativado com sucesso." : "Leitor desativado com sucesso.",
    errorFallback: "Falha ao atualizar status",
    invalidate: () => invalidate.users()
  });

  const saving = linkMutation.isPending || unlinkMutation.isPending || statusMutation.isPending;

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
      { key: "email", label: "E-mail", render: (user) => user.email },
      {
        key: "status",
        label: "Status",
        render: (user) => <StatusBadge active={user.status === "1"} />
      },
      {
        key: "actions",
        label: "Ações",
        stopRowClick: true,
        render: (user) => (
          <TableRowActions>
            {(user.status === "1" ? canBlockUser : canUpdateUser) ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => statusMutation.mutate(user)}
                disabled={saving}
              >
                {user.status === "1" ? <UserX size={14} /> : <UserCheck size={14} />}
                {user.status === "1" ? "Desativar" : "Ativar"}
              </motion.button>
            ) : null}
            {canUpdateUser ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => {
                  setUnlinkError("");
                  setUserToUnlink(user);
                }}
                disabled={saving}
              >
                <Link2Off size={14} />
                Desvincular
              </motion.button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [canBlockUser, canUpdateUser, saving, statusMutation]
  );

  const listingError = usersQuery.error
    ? getQueryErrorMessage(usersQuery.error, "Falha ao carregar leitores do acervo")
    : unlinkError || undefined;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Leitores do app que acessam este acervo.{" "}
          <Link to={`/usuarios?acervoId=${acervo.id}`} className="font-medium text-primary hover:underline">
            Ver em Usuários
          </Link>
        </p>
        {canUpdateUser ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAddError("");
              setAddModalOpen(true);
            }}
            disabled={saving || !acervoActive}
            title={!acervoActive ? "Ative o acervo para vincular leitores." : undefined}
          >
            <Plus size={16} />
            Adicionar leitores
          </Button>
        ) : null}
      </div>

      <AdminListingSection<UserResponse>
        title="Leitores do acervo"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, e-mail ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredUsers}
        loading={usersQuery.isLoading}
        keyExtractor={(user) => user.id}
        emptyMessage="Nenhum leitor encontrado para os filtros aplicados."
        emptyState={
          !usersQuery.isLoading && users.length === 0 && !search.trim() && statusFilter === "all" ? (
            <EmptyState
              icon={Users}
              title="Nenhum leitor vinculado a este acervo"
              description={
                acervoActive
                  ? "Vincule leitores existentes ou cadastre novos usuarios ja escolhendo este acervo."
                  : "Ative o acervo para poder vincular leitores."
              }
              action={
                canUpdateUser && acervoActive
                  ? {
                      label: "Adicionar leitores",
                      icon: Plus,
                      onClick: () => {
                        setAddError("");
                        setAddModalOpen(true);
                      }
                    }
                  : undefined
              }
              secondaryAction={{ label: "Cadastrar um usuario novo", to: "/usuarios" }}
            />
          ) : undefined
        }
        countLabel={`${filteredUsers.length} de ${users.length} leitor(es)`}
        error={listingError}
        renderMobileCard={(user) => (
          <article className="book-card">
            <LegacyImage
              legacyPath={user.userImage}
              folder="images"
              alt={`Avatar de ${decodeHtmlEntities(user.name)}`}
              className="table-avatar"
              fallbackClassName="table-avatar-placeholder"
              fallbackText={decodeHtmlEntities(user.name).charAt(0).toUpperCase()}
            />
            <div className="book-card-body">
              <p className="book-card-id">#{user.id}</p>
              <h3>{decodeHtmlEntities(user.name)}</h3>
              <p className="book-card-author">{user.email}</p>
              <StatusBadge active={user.status === "1"} />
            </div>
          </article>
        )}
      />

      <AddReadersToAcervoModal
        acervo={acervo}
        open={addModalOpen}
        saving={linkMutation.isPending}
        progress={progress}
        error={addError}
        onClose={() => {
          if (!linkMutation.isPending) {
            setAddModalOpen(false);
            setAddError("");
          }
        }}
        onConfirm={(selectedUsers) => linkMutation.mutate(selectedUsers)}
      />

      <ConfirmDialog
        open={userToUnlink !== null}
        title="Desvincular leitor do acervo"
        description={
          userToUnlink
            ? `${decodeHtmlEntities(userToUnlink.name)} ficara sem acervo e nao vera nenhum livro no app ate ser vinculado novamente.`
            : undefined
        }
        confirmLabel="Desvincular"
        loading={unlinkMutation.isPending}
        onConfirm={() => {
          if (userToUnlink) {
            unlinkMutation.mutate(userToUnlink);
          }
        }}
        onCancel={() => setUserToUnlink(null)}
      />
    </>
  );
}
