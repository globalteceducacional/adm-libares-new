import { motion } from "framer-motion";
import { Pencil, Tags, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createSiteCategory,
  deleteSiteCategory,
  updateSiteCategory,
  uploadSiteCategoryImage
} from "../../services/siteCategoriesService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSiteCategoriesQuery
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
import type { SiteCategoryResponse, UpsertSiteCategoryRequest } from "../../types/siteCategories";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function SiteCategoriesPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const categoriesQuery = useSiteCategoriesQuery();
  const invalidate = useInvalidateAdminQueries();
  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isLoading;
  const listingError = categoriesQuery.error
    ? getQueryErrorMessage(categoriesQuery.error, "Falha ao carregar categorias do Site")
    : undefined;

  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSiteCategoryRequest>({
    name: "",
    image: "",
    status: "1"
  });

  const isNameInvalid = form.name.trim().length === 0;
  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");

  function resetForm() {
    setForm({ name: "", image: "", status: "1" });
    setEditingId(null);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setFormError("");
    setUploadingImage(true);
    try {
      const response = await uploadSiteCategoryImage(file);
      setForm((current) => ({ ...current, image: response.filename }));
    } catch (uploadError) {
      setFormError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar imagem");
    } finally {
      setUploadingImage(false);
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
      const payload: UpsertSiteCategoryRequest = {
        name: form.name.trim(),
        image: form.image?.trim() || undefined,
        status: form.status
      };
      if (editingId) {
        await updateSiteCategory(editingId, payload);
        showSuccess("Categoria do Site atualizada com sucesso.");
      } else {
        await createSiteCategory(payload);
        showSuccess("Categoria do Site criada com sucesso.");
      }
      resetForm();
      await invalidate.siteCategories();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar categoria");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: SiteCategoryResponse) {
    setEditingId(category.id);
    setForm({
      name: decodeHtmlEntities(category.name),
      image: category.image ?? "",
      status: category.status
    });
    document.getElementById("site-category-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const categoryId = confirmDeleteId;
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteSiteCategory(categoryId);
      if (editingId === categoryId) {
        resetForm();
      }
      showSuccess("Categoria do Site desativada com sucesso.");
      await invalidate.siteCategories();
    } catch (deleteError) {
      setFormError(
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar categoria"
      );
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const byStatus = statusFilter === "all" || category.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(category.name).toLowerCase().includes(normalized) ||
        String(category.id).includes(normalized);
      return byStatus && byText;
    });
  }, [categories, search, statusFilter]);

  const columns = useMemo<DataTableColumn<SiteCategoryResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (category) => category.id },
      {
        key: "image",
        label: "Imagem",
        render: (category) => (
          <LegacyImage
            legacyPath={category.image}
            folder="images"
            alt={`Imagem de ${decodeHtmlEntities(category.name)}`}
            className="table-avatar"
            fallbackClassName="table-avatar-placeholder"
            fallbackText={decodeHtmlEntities(category.name).charAt(0).toUpperCase()}
          />
        )
      },
      { key: "name", label: "Nome", render: (category) => decodeHtmlEntities(category.name) },
      {
        key: "status",
        label: "Status",
        render: (category) => <StatusBadge active={category.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (category) => (
          <TableRowActions>
            {canUpdate ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(category)}
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
                onClick={() => setConfirmDeleteId(category.id)}
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
    const active = categories.filter((category) => category.status === "1").length;
    return [
      { label: "Total de categorias", value: categories.length },
      { label: "Ativas", value: active },
      { label: "Exibidas", value: filteredCategories.length, hint: "com filtros atuais" }
    ];
  }, [categories, filteredCategories]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Tags}
          title="Categorias do Site"
          description="Gerencie categorias globais do catalogo Site."
          tone="warning"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <PermissionGate permission={editingId ? "sites.update" : "sites.create"}>
        <BerryFormPanel
          id="site-category-form"
          icon={Tags}
          title={editingId ? "Editar categoria" : "Cadastrar nova categoria"}
          description="Defina nome, imagem e status da categoria Site."
        >
          <form className="book-form modern" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nome</span>
              <input
                type="text"
                value={form.name}
                maxLength={255}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              {isNameInvalid ? <small className="warning-text">Informe um nome valido.</small> : null}
            </label>
            <div className="form-field">
              <span>Imagem da categoria</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={saving || uploadingImage}
              />
              {uploadingImage ? <small className="form-hint">Enviando imagem...</small> : null}
              {form.image ? (
                <div className="book-cover-preview">
                  <LegacyImage
                    legacyPath={form.image}
                    folder="images"
                    alt="Pre-visualizacao da imagem"
                    className="table-avatar h-24 w-24"
                    fallbackClassName="table-avatar-placeholder h-24 w-24"
                    fallbackText={form.name.trim().charAt(0).toUpperCase() || "C"}
                  />
                  <small className="form-hint">{form.image}</small>
                </div>
              ) : null}
            </div>
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
            <div className="book-form-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="primary-btn"
                type="submit"
                disabled={saving || uploadingImage || isNameInvalid}
              >
                {saving ? "Salvando..." : editingId ? "Atualizar categoria" : "Criar categoria"}
              </motion.button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => {
                  resetForm();
                  clearSuccess();
                  setFormError("");
                }}
                disabled={saving || uploadingImage}
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

      <AdminListingSection<SiteCategoryResponse>
        title="Listagem de categorias"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredCategories}
        loading={loading}
        keyExtractor={(category) => category.id}
        emptyMessage="Nenhuma categoria encontrada para os filtros aplicados."
        countLabel={`${filteredCategories.length} categoria(s) com o filtro atual`}
        error={listingError}
        renderMobileCard={(category) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={category.image}
                folder="images"
                alt={`Imagem de ${decodeHtmlEntities(category.name)}`}
                className="table-avatar"
                fallbackClassName="table-avatar-placeholder"
                fallbackText={decodeHtmlEntities(category.name).charAt(0).toUpperCase()}
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{category.id}</p>
              <h3>{decodeHtmlEntities(category.name)}</h3>
              <StatusBadge active={category.status === "1"} />
            </div>
          </article>
        )}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar categoria"
        description="A categoria sera marcada como inativa. Deseja continuar?"
        confirmLabel="Desativar"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
