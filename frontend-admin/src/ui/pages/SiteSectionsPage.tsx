import { motion } from "framer-motion";
import { LayoutList, Pencil, Trash2 } from "lucide-react";
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
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { SiteSectionResponse, UpsertSiteSectionRequest } from "../../types/siteSections";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, ConfirmDialog, StatusBadge } from "../../shared/ui";
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
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSiteSectionRequest>(EMPTY_FORM);

  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");
  const isTitleInvalid = form.title.trim().length === 0;

  const activeSites = useMemo(() => sites.filter((site) => site.status === "1"), [sites]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
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
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      const payload: UpsertSiteSectionRequest = {
        title: form.title.trim(),
        siteIds: [...form.siteIds],
        status: form.status
      };
      if (editingId) {
        await updateSiteSection(editingId, payload);
        showSuccess("Seção do Site atualizada com sucesso.");
      } else {
        await createSiteSection(payload);
        showSuccess("Seção do Site criada com sucesso.");
      }
      resetForm();
      await invalidate.siteSections();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar seção");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(section: SiteSectionResponse) {
    setEditingId(section.id);
    setForm({
      title: decodeHtmlEntities(section.title),
      siteIds: [...section.siteIds],
      status: section.status
    });
    document.getElementById("site-section-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const sectionId = confirmDeleteId;
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteSiteSection(sectionId);
      if (editingId === sectionId) {
        resetForm();
      }
      showSuccess("Seção do Site desativada com sucesso.");
      await invalidate.siteSections();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar seção");
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
            {canDelete ? (
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
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <PermissionGate permission={editingId ? "sites.update" : "sites.create"}>
        <BerryFormPanel
          id="site-section-form"
          icon={LayoutList}
          title={editingId ? "Editar seção" : "Cadastrar nova seção"}
          description="Defina o titulo, status e os sites vinculados a esta seção."
        >
          <form className="book-form modern" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Titulo</span>
              <input
                type="text"
                value={form.title}
                maxLength={150}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
              {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
            </label>

            <label className="form-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </label>

            <div className="form-field">
              <span>Sites da seção</span>
              {sitesQuery.isLoading ? (
                <small className="form-hint">Carregando sites...</small>
              ) : activeSites.length === 0 ? (
                <small className="form-hint">Nenhum site ativo disponivel.</small>
              ) : (
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-border bg-surface-2/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeSites.map((site) => (
                    <label key={site.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 accent-primary"
                        checked={form.siteIds.includes(site.id)}
                        onChange={() => toggleSite(site.id)}
                        disabled={saving}
                      />
                      <span>
                        <span className="font-medium">#{site.id}</span>{" "}
                        {decodeHtmlEntities(site.title)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <small className="form-hint">{form.siteIds.length} site(s) selecionado(s)</small>
            </div>

            <div className="book-form-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="primary-btn"
                type="submit"
                disabled={saving || isTitleInvalid}
              >
                {saving ? "Salvando..." : editingId ? "Atualizar seção" : "Criar seção"}
              </motion.button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => {
                  resetForm();
                  clearSuccess();
                  setFormError("");
                }}
                disabled={saving}
              >
                Limpar formulario
              </button>
            </div>
          </form>
          {success ? (
            <Alert tone="success" className="mt-3">
              {success}
            </Alert>
          ) : null}
          {formError ? (
            <Alert tone="danger" className="mt-3">
              {formError}
            </Alert>
          ) : null}
        </BerryFormPanel>
      </PermissionGate>

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
