import { motion } from "framer-motion";
import { Globe, Pencil, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createSite,
  deleteSite,
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
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { UpsertSiteRequest, SiteResponse } from "../../types/sites";
import { EMPTY_SITE_FORM } from "../../types/sites";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

function toggleId(current: number[], id: number): number[] {
  return current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
}

export function SitesPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const sitesQuery = useSitesQuery();
  const authorsQuery = useSiteAuthorsQuery();
  const categoriesQuery = useSiteCategoriesQuery();
  const invalidate = useInvalidateAdminQueries();

  const sites = sitesQuery.data ?? [];
  const authors = authorsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loading = sitesQuery.isLoading;
  const listingError = sitesQuery.error
    ? getQueryErrorMessage(sitesQuery.error, "Falha ao carregar sites")
    : undefined;

  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSiteRequest>(EMPTY_SITE_FORM);

  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");

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

  function resetForm() {
    setForm(EMPTY_SITE_FORM);
    setEditingId(null);
    setUploadError("");
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
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

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
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
    setFormError("");
    clearSuccess();
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
        showSuccess("Site atualizado com sucesso.");
      } else {
        await createSite(payload);
        showSuccess("Site criado com sucesso.");
      }
      resetForm();
      await invalidate.sites();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar site");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(site: SiteResponse) {
    setEditingId(site.id);
    setUploadError("");
    setFormError("");
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
    document.getElementById("site-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const siteId = confirmDeleteId;
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteSite(siteId);
      if (editingId === siteId) {
        resetForm();
      }
      showSuccess("Site excluido com sucesso.");
      await invalidate.sites();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao excluir site");
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
          <StatusBadge
            active={site.featured === "1"}
            activeLabel="Sim"
            inactiveLabel="Nao"
          />
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
    [saving, canUpdate, canDelete, authorById]
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

  const optionsError =
    authorsQuery.error
      ? getQueryErrorMessage(authorsQuery.error, "Falha ao carregar autores")
      : categoriesQuery.error
        ? getQueryErrorMessage(categoriesQuery.error, "Falha ao carregar categorias")
        : "";

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Globe}
          title="Sites"
          description="Gerencie conteudos do catalogo Site: capa, arquivo, categorias e destaque."
          tone="primary"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <PermissionGate permission={editingId ? "sites.update" : "sites.create"}>
        <BerryFormPanel
          id="site-form"
          icon={Globe}
          title={editingId ? "Editar site" : "Cadastrar novo site"}
          description="Preencha categorias, autor, titulo, descricao, capa e arquivo."
        >
          <form className="book-form modern" onSubmit={handleSubmit}>
            <fieldset className="form-field acervo-fieldset">
              <legend>Categorias</legend>
              {activeCategories.length === 0 ? (
                <small className="warning-text">Nenhuma categoria ativa cadastrada.</small>
              ) : (
                <div className="acervo-checkbox-grid">
                  {activeCategories.map((category) => (
                    <label key={category.id} className="acervo-checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(category.id)}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            categoryIds: toggleId(current.categoryIds, category.id)
                          }))
                        }
                      />
                      <span>{decodeHtmlEntities(category.name)}</span>
                    </label>
                  ))}
                </div>
              )}
              {isCategoriesInvalid ? (
                <small className="warning-text">Selecione ao menos uma categoria.</small>
              ) : null}
            </fieldset>

            <label className="form-field">
              <span>Autor</span>
              <select
                value={form.authorId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    authorId: Number(event.target.value) || 0
                  }))
                }
                required
              >
                <option value={0}>Selecione um autor</option>
                {authorOptions.map((author) => (
                  <option key={author.id} value={author.id}>
                    {decodeHtmlEntities(author.name)} (#{author.id})
                  </option>
                ))}
              </select>
              {isAuthorInvalid ? (
                <small className="warning-text">Selecione um autor antes de salvar.</small>
              ) : null}
            </label>

            <label className="form-field">
              <span>Titulo</span>
              <input
                type="text"
                value={form.title}
                maxLength={255}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
              {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
            </label>

            <label className="form-field">
              <span>Descricao</span>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                required
              />
              {isDescriptionInvalid ? (
                <small className="warning-text">A descricao e obrigatoria.</small>
              ) : null}
            </label>

            <div className="form-field">
              <span>Capa</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={saving || uploadingCover}
              />
              {uploadingCover ? <small className="form-hint">Enviando capa...</small> : null}
              {form.coverImage ? (
                <div className="book-cover-preview">
                  <LegacyImage
                    legacyPath={form.coverImage}
                    folder="images"
                    alt="Pre-visualizacao da capa"
                    className="book-form-cover"
                    fallbackClassName="book-form-cover-placeholder"
                    fallbackText="Capa indisponivel"
                  />
                  <small className="form-hint">{form.coverImage}</small>
                </div>
              ) : null}
              {isCoverInvalid ? <small className="warning-text">Envie a imagem da capa.</small> : null}
            </div>

            <label className="form-field">
              <span>Tipo de arquivo</span>
              <select
                value={form.fileType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fileType: event.target.value === "local" ? "local" : "server_url"
                  }))
                }
              >
                <option value="server_url">URL externa (server_url)</option>
                <option value="local">Arquivo local</option>
              </select>
            </label>

            {form.fileType === "server_url" ? (
              <label className="form-field">
                <span>URL do arquivo</span>
                <input
                  type="url"
                  value={form.fileUrl ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fileUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
            ) : (
              <div className="form-field">
                <span>Arquivo (PDF ou EPUB)</span>
                <input
                  type="file"
                  accept=".pdf,.epub,application/pdf,application/epub+zip"
                  onChange={handleFileChange}
                  disabled={saving || uploadingFile}
                />
                {uploadingFile ? <small className="form-hint">Enviando arquivo...</small> : null}
                {form.fileUrl ? <small className="form-hint break-all">{form.fileUrl}</small> : null}
              </div>
            )}
            {isFileInvalid ? (
              <small className="warning-text">
                {form.fileType === "server_url"
                  ? "Informe a URL do arquivo."
                  : "Envie o arquivo PDF ou EPUB."}
              </small>
            ) : null}

            <label className="form-field acervo-checkbox-item">
              <input
                type="checkbox"
                checked={form.featured === "1"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    featured: event.target.checked ? "1" : "0"
                  }))
                }
              />
              <span>Destaque na home (featured)</span>
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

            {uploadError ? <p className="error-text">{uploadError}</p> : null}

            <div className="book-form-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="primary-btn"
                type="submit"
                disabled={saving || uploadingCover || uploadingFile || isFormInvalid}
              >
                {saving ? "Salvando..." : editingId ? "Atualizar site" : "Criar site"}
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
          {formError || optionsError ? (
            <Alert tone="danger" className="mt-3">
              {formError || optionsError}
            </Alert>
          ) : null}
        </BerryFormPanel>
      </PermissionGate>

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
            </div>
          </article>
        )}
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
