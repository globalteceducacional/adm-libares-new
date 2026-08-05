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
import { SiteSectionFormModal } from "../components/siteSections/SiteSectionFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { SiteSectionResponse, UpsertSiteSectionRequest } from "../../types/siteSections";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Button, ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertSiteSectionRequest = {
  title: "",
  siteIds: [],
  status: "1"
};

export function SiteSectionsPage() {
  const location = useLocation();
  const { showToast } = useToast();
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
  const [saving, setSaving] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSiteSectionRequest>(EMPTY_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");
  const isTitleInvalid = form.title.trim().length === 0;

  const activeSites = useMemo(() => sites.filter((site) => site.status === "1"), [sites]);

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
    setSaving(true);
    try {
      const payload: UpsertSiteSectionRequest = {
        title: form.title.trim(),
        siteIds: [...form.siteIds],
        status: form.status
      };
      if (editingId) {
        await updateSiteSection(editingId, payload);
        showToast("Seção do Site atualizada com sucesso.", "success");
      } else {
        await createSiteSection(payload);
        showToast("Seção do Site criada com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.siteSections();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar seção");
    } finally {
      setSaving(false);
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
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(section: SiteSectionResponse) {
    if (!canUpdate) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateSiteSection(section.id, {
        title: section.title,
        siteIds: [...section.siteIds],
        status: "1"
      });
      showToast("Seção do Site ativada com sucesso.", "success");
      await invalidate.siteSections();
    } catch (activateError) {
      const message =
        activateError instanceof Error ? activateError.message : "Falha ao ativar seção";
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
    const sectionId = confirmDeleteId;
    setFormError("");
    setSaving(true);
    try {
      await deleteSiteSection(sectionId);
      if (editingId === sectionId) {
        closeFormModal();
      }
      showToast("Seção do Site desativada com sucesso.", "success");
      await invalidate.siteSections();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar seção";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
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
