import { motion } from "framer-motion";
import { Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createSite,
  deleteSite,
  toggleSiteStatus,
  updateSite,
  uploadSiteCover,
  uploadSiteFile
} from "../../services/sitesService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSiteAuthorsQuery,
  useSiteCategoriesQuery,
  useSitesQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { SiteFormModal } from "../components/sites/SiteFormModal";
import { SiteDetailModal } from "../components/sites/SiteDetailModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { UpsertSiteRequest, SiteResponse } from "../../types/sites";
import { EMPTY_SITE_FORM } from "../../types/sites";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function SitesPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const sitesQuery = useSitesQuery();
  const invalidate = useInvalidateAdminQueries();
  const { showToast } = useToast();

  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canToggle = usePermission("sites.toggle_status");
  const canDelete = usePermission("sites.delete");
  const professorMode = canToggle && !canUpdate && !canCreate;
  const canManage = canCreate || canUpdate;

  const authorsQuery = useSiteAuthorsQuery({ enabled: canManage });
  const categoriesQuery = useSiteCategoriesQuery({ enabled: canManage });

  const sites = sitesQuery.data ?? [];
  const authors = authorsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loading = sitesQuery.isLoading;
  const listingError = sitesQuery.error
    ? getQueryErrorMessage(sitesQuery.error, "Falha ao carregar sites")
    : undefined;

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedSite, setSelectedSite] = useState<SiteResponse | null>(null);
  const [form, setForm] = useState<UpsertSiteRequest>(EMPTY_SITE_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const activeAuthors = useMemo(() => authors.filter((author) => author.status === "1"), [authors]);
  const activeCategories = useMemo(
    () => categories.filter((category) => category.status === "1"),
    [categories]
  );

  const selectedAuthorExists = activeAuthors.some((author) => author.id === form.authorId);
  const authorOptions =
    form.authorId > 0 && !selectedAuthorExists
      ? [
          ...activeAuthors,
          {
            id: form.authorId,
            name: "Autor vinculado (inativo/indisponivel)",
            image: "",
            description: null,
            status: "0"
          }
        ]
      : activeAuthors;

  const isAuthorInvalid = form.authorId <= 0;
  const isTitleInvalid = form.title.trim().length === 0;
  const isCategoriesInvalid = form.categoryIds.length === 0;
  const isDescriptionInvalid = form.description.trim().length === 0;
  const isCoverInvalid = !editingId && !form.coverImage;
  const isFileInvalid =
    form.fileType === "server_url"
      ? (form.fileUrl ?? "").trim().length === 0
      : !editingId && (form.fileUrl ?? "").trim().length === 0;
  const isFormInvalid =
    isAuthorInvalid ||
    isTitleInvalid ||
    isCategoriesInvalid ||
    isDescriptionInvalid ||
    isCoverInvalid ||
    isFileInvalid;

  const authorById = useMemo(() => {
    const map = new Map<number, string>();
    for (const author of authors) {
      map.set(author.id, decodeHtmlEntities(author.name));
    }
    return map;
  }, [authors]);

  const categoryById = useMemo(() => {
    const map = new Map<number, string>();
    for (const category of categories) {
      map.set(category.id, decodeHtmlEntities(category.name));
    }
    return map;
  }, [categories]);

  useEffect(() => {
    setSelectedSite((current) => {
      if (!current) {
        return null;
      }
      return sites.find((item) => item.id === current.id) ?? null;
    });
  }, [sites]);

  function resetForm() {
    setForm(EMPTY_SITE_FORM);
    setEditingId(null);
    setUploadError("");
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

  async function handleCoverSelected(file: File) {
    setUploadError("");
    setUploadingCover(true);
    try {
      const response = await uploadSiteCover(file);
      setForm((current) => ({ ...current, coverImage: response.filename }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Falha ao enviar capa");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSiteFileSelected(file: File) {
    setUploadError("");
    setUploadingFile(true);
    try {
      const response = await uploadSiteFile(file);
      setForm((current) => ({
        ...current,
        fileType: "local",
        fileUrl: response.fileUrl
      }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Falha ao enviar arquivo");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId ? !canUpdate : !canCreate) {
      setFormError("Sem permissao para esta acao.");
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
      const payload: UpsertSiteRequest = {
        categoryIds: [...form.categoryIds],
        authorId: form.authorId,
        title: form.title.trim(),
        description: form.description.trim(),
        coverImage: form.coverImage?.trim() || null,
        fileType: form.fileType,
        fileUrl: form.fileUrl?.trim() || null,
        featured: form.featured,
        status: form.status
      };
      if (editingId) {
        await updateSite(editingId, payload);
        showToast("Site atualizado com sucesso.", "success");
      } else {
        await createSite(payload);
        showToast("Site criado com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.sites();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar site");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(site: SiteResponse) {
    setSelectedSite(null);
    setEditingId(site.id);
    setUploadError("");
    setFormError("");
    setShowValidation(false);
    setForm({
      categoryIds: [...site.categoryIds],
      authorId: site.authorId,
      title: decodeHtmlEntities(site.title),
      description: stripHtml(site.description) ?? site.description ?? "",
      coverImage: site.coverImage || null,
      fileType: site.fileType === "local" ? "local" : "server_url",
      fileUrl: site.fileUrl ?? "",
      featured: site.featured === "1" ? "1" : "0",
      status: site.status
    });
    setFormModalOpen(true);
  }

  async function handleToggleStatus(site: SiteResponse) {
    const nextStatus: "0" | "1" = site.status === "1" ? "0" : "1";
    setSaving(true);
    try {
      await toggleSiteStatus(site.id, nextStatus);
      const label = nextStatus === "1" ? "ativado" : "desativado";
      showToast(`Site ${label} com sucesso.`, "success");
      await invalidate.sites();
    } catch (toggleError) {
      const message =
        toggleError instanceof Error ? toggleError.message : "Falha ao alterar status";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const siteId = confirmDeleteId;
    setFormError("");
    setSaving(true);
    try {
      await deleteSite(siteId);
      if (editingId === siteId) {
        closeFormModal();
      }
      if (selectedSite?.id === siteId) {
        setSelectedSite(null);
      }
      showToast("Site excluido com sucesso.", "success");
      await invalidate.sites();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao excluir site");
      showToast(
        deleteError instanceof Error ? deleteError.message : "Falha ao excluir site",
        "error"
      );
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
  }

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const byStatus = statusFilter === "all" || site.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(site.title).toLowerCase().includes(normalized) ||
        (authorById.get(site.authorId) ?? "").toLowerCase().includes(normalized) ||
        String(site.id).includes(normalized);
      return byStatus && byText;
    });
  }, [sites, search, statusFilter, authorById]);

  const columns = useMemo<DataTableColumn<SiteResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (site) => site.id },
      {
        key: "cover",
        label: "Capa",
        render: (site) => (
          <LegacyImage
            legacyPath={site.coverImage}
            folder="images"
            alt={`Capa de ${decodeHtmlEntities(site.title)}`}
            className="table-avatar"
            fallbackClassName="table-avatar-placeholder"
            fallbackText={decodeHtmlEntities(site.title).charAt(0).toUpperCase()}
          />
        )
      },
      { key: "title", label: "Titulo", render: (site) => decodeHtmlEntities(site.title) },
      {
        key: "author",
        label: "Autor",
        render: (site) => authorById.get(site.authorId) ?? `#${site.authorId}`
      },
      {
        key: "featured",
        label: "Destaque",
        render: (site) => (
          <StatusBadge active={site.featured === "1"} activeLabel="Sim" inactiveLabel="Nao" />
        )
      },
      {
        key: "status",
        label: "Status",
        render: (site) => <StatusBadge active={site.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (site) => (
          <TableRowActions>
            {canUpdate ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(site)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canToggle ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleToggleStatus(site)}
                disabled={saving}
                aria-label={
                  site.status === "1"
                    ? `Desativar o site ${decodeHtmlEntities(site.title)}`
                    : `Ativar o site ${decodeHtmlEntities(site.title)}`
                }
              >
                {site.status === "1" ? "Desativar" : "Ativar"}
              </motion.button>
            ) : null}
            {canDelete ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(site.id)}
                disabled={saving}
              >
                <Trash2 size={14} />
                Excluir
              </motion.button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [saving, canUpdate, canDelete, canToggle, authorById]
  );

  const listStats = useMemo(() => {
    const active = sites.filter((site) => site.status === "1").length;
    const featured = sites.filter((site) => site.featured === "1").length;
    return [
      { label: "Total de sites", value: sites.length },
      { label: "Ativos", value: active },
      { label: "Destaques", value: featured },
      { label: "Exibidos", value: filteredSites.length, hint: "com filtros atuais" }
    ];
  }, [sites, filteredSites]);

  const formErrorMessage =
    formError ||
    (authorsQuery.error
      ? getQueryErrorMessage(authorsQuery.error, "Falha ao carregar autores")
      : categoriesQuery.error
        ? getQueryErrorMessage(categoriesQuery.error, "Falha ao carregar categorias")
        : "");

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Globe}
          title="Sites"
          description={
            professorMode
              ? "Visualize e ative/desative os conteudos do catalogo Site."
              : "Gerencie conteudos do catalogo Site: capa, arquivo, categorias e destaque."
          }
          tone="primary"
          actions={
            <PermissionGate permission="sites.create">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="primary-btn icon"
                type="button"
                onClick={openCreateForm}
              >
                <Plus size={16} />
                Novo site
              </motion.button>
            </PermissionGate>
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <AdminListingSection<SiteResponse>
        title="Listagem de sites"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por titulo, autor ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredSites}
        loading={loading}
        keyExtractor={(site) => site.id}
        emptyMessage="Nenhum site encontrado para os filtros aplicados."
        countLabel={`${filteredSites.length} site(s) com o filtro atual`}
        error={listingError}
        onRowClick={setSelectedSite}
        renderMobileCard={(site) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={site.coverImage}
                folder="images"
                alt={`Capa de ${decodeHtmlEntities(site.title)}`}
                className="table-avatar"
                fallbackClassName="table-avatar-placeholder"
                fallbackText={decodeHtmlEntities(site.title).charAt(0).toUpperCase()}
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{site.id}</p>
              <h3>{decodeHtmlEntities(site.title)}</h3>
              <p className="book-card-author">
                {authorById.get(site.authorId) ?? `Autor #${site.authorId}`}
              </p>
              <StatusBadge active={site.status === "1"} />
              <div className="book-card-actions">
                {canToggle ? (
                  <button
                    type="button"
                    className="table-btn icon"
                    onClick={() => handleToggleStatus(site)}
                    disabled={saving}
                  >
                    {site.status === "1" ? "Desativar" : "Ativar"}
                  </button>
                ) : null}
                {canUpdate ? (
                  <button
                    type="button"
                    className="table-btn icon"
                    onClick={() => handleEdit(site)}
                    disabled={saving}
                  >
                    Editar
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        )}
      />

      <SiteFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        authorOptions={authorOptions}
        categoryOptions={activeCategories}
        isAuthorInvalid={showValidation && isAuthorInvalid}
        isTitleInvalid={showValidation && isTitleInvalid}
        isCategoriesInvalid={showValidation && isCategoriesInvalid}
        isDescriptionInvalid={showValidation && isDescriptionInvalid}
        isCoverInvalid={showValidation && isCoverInvalid}
        isFileInvalid={showValidation && isFileInvalid}
        saving={saving}
        uploadingCover={uploadingCover}
        uploadingFile={uploadingFile}
        uploadError={uploadError}
        error={formErrorMessage}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
        onCoverSelected={handleCoverSelected}
        onSiteFileSelected={handleSiteFileSelected}
      />

      <SiteDetailModal
        site={selectedSite}
        open={selectedSite !== null}
        saving={saving}
        authorLabel={
          selectedSite
            ? authorById.get(selectedSite.authorId) ?? `Autor #${selectedSite.authorId}`
            : undefined
        }
        categoryLabels={
          selectedSite
            ? selectedSite.categoryIds.map(
                (id) => categoryById.get(id) ?? `Categoria #${id}`
              )
            : []
        }
        canUpdate={canUpdate}
        canToggle={canToggle}
        canDelete={canDelete}
        onClose={() => setSelectedSite(null)}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={(site) => setConfirmDeleteId(site.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir site"
        description="Esta acao remove o site e dados relacionados do modulo Site. Deseja continuar?"
        confirmLabel="Excluir"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
