import { motion } from "framer-motion";
import { LayoutList, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createSiteSection,
  deleteSiteSection,
  updateSiteSection
} from "../../services/siteSectionsService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSiteSectionsQuery,
  useSitesQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { SiteSectionDetailModal } from "../components/siteSections/SiteSectionDetailModal";
import { SiteSectionFormModal } from "../components/siteSections/SiteSectionFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { SiteSectionResponse, UpsertSiteSectionRequest } from "../../types/siteSections";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { useSelectedEntity } from "../../hooks/useSelectedEntity";
import { Alert, Button, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertSiteSectionRequest = {
  title: "",
  siteIds: [],
  status: "1"
};

type SaveSiteSectionVariables = {
  editingId: number | null;
  payload: UpsertSiteSectionRequest;
};

export function SiteSectionsPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const sectionsQuery = useSiteSectionsQuery();
  const sitesQuery = useSitesQuery();
  const invalidate = useInvalidateAdminQueries();

  const sections = sectionsQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const loading = sectionsQuery.isLoading;
  const listingError = sectionsQuery.error
    ? getQueryErrorMessage(sectionsQuery.error, "Falha ao carregar seções do Site")
    : undefined;

  const [formError, setFormError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useSelectedEntity(sections);
  const [form, setForm] = useState<UpsertSiteSectionRequest>(EMPTY_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");
  const isTitleInvalid = form.title.trim().length === 0;

  const activeSites = useMemo(() => sites.filter((site) => site.status === "1"), [sites]);

  async function invalidateSiteSectionQueries() {
    await invalidate.siteSections();
  }

  const saveMutation = useAdminMutation<SiteSectionResponse, SaveSiteSectionVariables>({
    mutationFn: async ({ editingId: id, payload }) =>
      id ? updateSiteSection(id, payload) : createSiteSection(payload),
    successMessage: (_data, { editingId: id }) =>
      id ? "Seção do Site atualizada com sucesso." : "Seção do Site criada com sucesso.",
    errorFallback: "Falha ao salvar seção",
    toastError: false,
    invalidate: invalidateSiteSectionQueries,
    onSuccess: () => {
      closeFormModal();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const activateMutation = useAdminMutation<SiteSectionResponse, SiteSectionResponse>({
    mutationFn: (section) =>
      updateSiteSection(section.id, {
        title: section.title,
        siteIds: [...section.siteIds],
        status: "1"
      }),
    successMessage: "Seção do Site ativada com sucesso.",
    errorFallback: "Falha ao ativar seção",
    invalidate: invalidateSiteSectionQueries,
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: (sectionId) => deleteSiteSection(sectionId),
    successMessage: "Seção do Site desativada com sucesso.",
    errorFallback: "Falha ao desativar seção",
    invalidate: invalidateSiteSectionQueries,
    onSuccess: (_data, sectionId) => {
      if (editingId === sectionId) {
        closeFormModal();
      }
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
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
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowValidation(false);
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

  function toggleSite(siteId: number) {
    setForm((current) => {
      const exists = current.siteIds.includes(siteId);
      return {
        ...current,
        siteIds: exists
          ? current.siteIds.filter((id) => id !== siteId)
          : [...current.siteIds, siteId]
      };
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId ? !canUpdate : !canCreate) {
      setFormError("Sem permissao para esta acao.");
      return;
    }
    setShowValidation(true);
    if (isTitleInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    try {
      await saveMutation.mutateAsync({
        editingId,
        payload: {
          title: form.title.trim(),
          siteIds: [...form.siteIds],
          status: form.status
        }
      });
    } catch {
      // Erro ja tratado em onError do useAdminMutation (formError).
    }
  }

  function handleEdit(section: SiteSectionResponse) {
    setEditingId(section.id);
    setFormError("");
    setShowValidation(false);
    setForm({
      title: decodeHtmlEntities(section.title),
      siteIds: [...section.siteIds],
      status: section.status
    });
    setSelectedSection(null);
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  function handleActivate(section: SiteSectionResponse) {
    if (!canUpdate) {
      return;
    }
    setFormError("");
    activateMutation.mutate(section);
  }

  function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    setFormError("");
    deleteMutation.mutate(confirmDeleteId);
  }

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      const byStatus = statusFilter === "all" || section.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(section.title).toLowerCase().includes(normalized) ||
        String(section.id).includes(normalized);
      return byStatus && byText;
    });
  }, [sections, search, statusFilter]);

  const columns = useMemo<DataTableColumn<SiteSectionResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (section) => section.id },
      { key: "title", label: "Titulo", render: (section) => decodeHtmlEntities(section.title) },
      {
        key: "sites",
        label: "Sites",
        render: (section) => `${section.siteCount} site(s)`
      },
      {
        key: "status",
        label: "Status",
        render: (section) => <StatusBadge active={section.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (section) => (
          <TableRowActions>
            {canUpdate ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(section)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canUpdate && section.status !== "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleActivate(section)}
                disabled={saving}
              >
                <Power size={14} />
                Ativar
              </motion.button>
            ) : null}
            {canDelete && section.status === "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(section.id)}
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
    const active = sections.filter((section) => section.status === "1").length;
    return [
      { label: "Total de seções", value: sections.length },
      { label: "Ativas", value: active },
      { label: "Exibidas", value: filteredSections.length, hint: "com filtros atuais" }
    ];
  }, [sections, filteredSections]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={LayoutList}
          title="Seções do Site"
          description="Gerencie seções da home do Site e vincule conteudos."
          tone="primary"
          actions={
            <PermissionGate permission="sites.create">
              <Button type="button" onClick={openCreateForm} disabled={saving}>
                <Plus size={16} />
                Nova seção
              </Button>
            </PermissionGate>
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

      <AdminListingSection<SiteSectionResponse>
        title="Listagem de seções"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por titulo ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredSections}
        loading={loading}
        keyExtractor={(section) => section.id}
        emptyMessage="Nenhuma seção encontrada para os filtros aplicados."
        countLabel={`${filteredSections.length} seção(ões) com o filtro atual`}
        error={listingError}
        onRowClick={setSelectedSection}
        renderMobileCard={(section) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{section.id}</p>
              <h3>{decodeHtmlEntities(section.title)}</h3>
              <p className="text-sm text-muted">{section.siteCount} site(s)</p>
              <StatusBadge active={section.status === "1"} />
            </div>
          </article>
        )}
      />

      <SiteSectionFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isTitleInvalid={showValidation && isTitleInvalid}
        sitesLoading={sitesQuery.isLoading}
        activeSites={activeSites}
        saving={saving}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
        onToggleSite={toggleSite}
      />

      <SiteSectionDetailModal
        section={selectedSection}
        open={selectedSection !== null}
        saving={saving}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onClose={() => setSelectedSection(null)}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onDelete={(section) => setConfirmDeleteId(section.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar seção"
        description="A seção sera marcada como inativa. Deseja continuar?"
        confirmLabel="Desativar"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
