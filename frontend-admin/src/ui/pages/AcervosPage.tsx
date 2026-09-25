import { motion } from "framer-motion";
import { Library, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getQueryErrorMessage, useAcervosQuery } from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { useAnyPermission } from "../../features/auth/usePermission";
import { AcervoFormModal } from "../components/acervos/AcervoFormModal";
import { acervoHubPath } from "../components/acervos/acervoRoutes";
import { useAcervoManager } from "../components/acervos/useAcervoManager";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { AcervoResponse } from "../../types/acervos";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Button, ConfirmDialog, EmptyState, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function AcervosPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const acervosQuery = useAcervosQuery();
  const acervos = acervosQuery.data ?? [];
  const manager = useAcervoManager();
  const {
    saving,
    formError,
    formModalOpen,
    schoolsError,
    openCreateForm,
    openEditForm,
    activate,
    confirmDeactivateId,
    requestDeactivate,
    cancelDeactivate,
    confirmDeactivate
  } = manager;

  const loading = acervosQuery.isLoading;
  const listingError = acervosQuery.error
    ? getQueryErrorMessage(acervosQuery.error, "Falha ao carregar acervos")
    : schoolsError;

  const canCreateAcervo = useAnyPermission(["acervos.create"]);
  const canUpdateAcervo = useAnyPermission(["acervos.update"]);
  const canDeleteAcervo = useAnyPermission(["acervos.delete"]);

  // Deep-link do checklist de onboarding: /acervos?new=1 abre o form de criacao uma unica vez.
  const [searchParams, setSearchParams] = useSearchParams();
  const handledNewParam = useRef(false);
  useEffect(() => {
    if (handledNewParam.current || searchParams.get("new") !== "1") {
      return;
    }
    handledNewParam.current = true;
    if (canCreateAcervo) {
      openCreateForm();
    }
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, canCreateAcervo, openCreateForm]);

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "all";

  const filteredAcervos = useMemo(() => {
    return acervos.filter((acervo) => {
      const byStatus = statusFilter === "all" || acervo.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const description = stripHtml(acervo.description)?.toLowerCase() ?? "";
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(acervo.name).toLowerCase().includes(normalized) ||
        description.includes(normalized) ||
        String(acervo.id).includes(normalized);
      return byStatus && byText;
    });
  }, [acervos, search, statusFilter]);

  const columns = useMemo<DataTableColumn<AcervoResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (acervo) => acervo.id },
      { key: "name", label: "Nome", render: (acervo) => decodeHtmlEntities(acervo.name) },
      {
        key: "school",
        label: "Contrato",
        render: (acervo) =>
          acervo.schoolName
            ? decodeHtmlEntities(acervo.schoolName)
            : acervo.schoolId
              ? `Contrato #${acervo.schoolId}`
              : "—"
      },
      {
        key: "books",
        label: "Livros",
        align: "right",
        render: (acervo) => acervo.bookCount.toLocaleString("pt-BR")
      },
      {
        key: "users",
        label: "Leitores",
        align: "right",
        render: (acervo) => acervo.userCount.toLocaleString("pt-BR")
      },
      {
        key: "status",
        label: "Status",
        render: (acervo) => <StatusBadge active={acervo.status === "1"} />
      },
      {
        key: "actions",
        label: "Ações",
        stopRowClick: true,
        render: (acervo) => (
          <TableRowActions>
            {canUpdateAcervo ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => openEditForm(acervo)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canUpdateAcervo && acervo.status !== "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => activate(acervo)}
                disabled={saving}
              >
                <Power size={14} />
                Ativar
              </motion.button>
            ) : null}
            {canDeleteAcervo && acervo.status === "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => requestDeactivate(acervo.id)}
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
    [saving, canUpdateAcervo, canDeleteAcervo, openEditForm, activate, requestDeactivate]
  );

  const listStats = useMemo(() => {
    const active = acervos.filter((acervo) => acervo.status === "1").length;
    const totalBooks = acervos.reduce((sum, acervo) => sum + acervo.bookCount, 0);
    const totalUsers = acervos.reduce((sum, acervo) => sum + acervo.userCount, 0);
    return [
      { label: "Total de acervos", value: acervos.length },
      { label: "Ativos", value: active },
      { label: "Livros vinculados", value: totalBooks },
      {
        label: "Leitores vinculados",
        value: totalUsers,
        hint: `${filteredAcervos.length} exibidos com filtros`
      }
    ];
  }, [acervos, filteredAcervos]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Library}
          title="Acervos"
          description="Gerencie as bibliotecas digitais de cada contrato. Clique em um acervo para gerenciar seus livros e leitores."
          tone="success"
          actions={
            canCreateAcervo ? (
              <PermissionGate anyOf={["acervos.create"]}>
                <Button type="button" onClick={openCreateForm} disabled={saving}>
                  <Plus size={16} />
                  Novo acervo
                </Button>
              </PermissionGate>
            ) : null
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {formError && !formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {formError}
        </Alert>
      ) : null}

      <AdminListingSection<AcervoResponse>
        title="Listagem de acervos"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, descricao ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredAcervos}
        loading={loading}
        keyExtractor={(acervo) => acervo.id}
        emptyMessage="Nenhum acervo encontrado para os filtros aplicados."
        emptyState={
          !loading && acervos.length === 0 && !hasActiveFilters ? (
            <EmptyState
              icon={Library}
              title="Nenhum acervo criado ainda"
              description="O acervo e a biblioteca que os leitores veem no app. Crie o primeiro, depois vincule livros e cadastre leitores."
              action={
                canCreateAcervo
                  ? { label: "Criar primeiro acervo", icon: Plus, onClick: openCreateForm }
                  : undefined
              }
            />
          ) : undefined
        }
        countLabel={`${filteredAcervos.length} acervo(s) com o filtro atual`}
        error={listingError}
        onRowClick={(acervo) => navigate(acervoHubPath(acervo.id))}
        renderMobileCard={(acervo) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{acervo.id}</p>
              <h3>{decodeHtmlEntities(acervo.name)}</h3>
              <p className="book-card-author">
                {acervo.schoolName
                  ? decodeHtmlEntities(acervo.schoolName)
                  : "Sem contrato"}{" "}
                · {acervo.bookCount} livros · {acervo.userCount} leitores
              </p>
              <StatusBadge active={acervo.status === "1"} />
            </div>
          </article>
        )}
      />

      <AcervoFormModal {...manager.formModalProps} />

      <ConfirmDialog
        open={confirmDeactivateId !== null}
        title="Desativar acervo"
        description="O acervo sera marcado como inativo. Deseja continuar?"
        confirmLabel="Desativar"
        loading={saving}
        onConfirm={confirmDeactivate}
        onCancel={cancelDeactivate}
      />
    </ListingPageShell>
  );
}
