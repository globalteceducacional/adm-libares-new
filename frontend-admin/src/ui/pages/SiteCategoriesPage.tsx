import { motion } from "framer-motion";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
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
import { SiteCategoryFormModal } from "../components/siteCategories/SiteCategoryFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { SiteCategoryResponse, UpsertSiteCategoryRequest } from "../../types/siteCategories";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, Button, ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertSiteCategoryRequest = {
  name: "",
  image: "",
  status: "1"
};

export function SiteCategoriesPage() {
  const location = useLocation();
  const { showToast } = useToast();
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
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSiteCategoryRequest>(EMPTY_FORM);

  const isNameInvalid = form.name.trim().length === 0;
  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function closeFormModal() {
    resetForm();
    clearSuccess();
    setFormError("");
    setFormModalOpen(false);
  }

  function openCreateForm() {
    resetForm();
    setFormError("");
    setFormModalOpen(true);
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
        showToast("Categoria do Site atualizada com sucesso.", "success");
      } else {
        await createSiteCategory(payload);
        showToast("Categoria do Site criada com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.siteCategories();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar categoria");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: SiteCategoryResponse) {
    setEditingId(category.id);
    setFormError("");
    setForm({
      name: decodeHtmlEntities(category.name),
      image: category.image ?? "",
      status: category.status
    });
    setFormModalOpen(true);
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
        closeFormModal();
      }
      showSuccess("Categoria do Site desativada com sucesso.");
      await invalidate.siteCategories();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar categoria";
      setFormError(message);
      showToast(message, "error");
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
          actions={
            <PermissionGate permission="sites.create">
              <Button type="button" onClick={openCreateForm} disabled={saving}>
                <Plus size={16} />
                Nova categoria
              </Button>
            </PermissionGate>
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {success ? (
        <Alert tone="success" className="mb-3">
          {success}
        </Alert>
      ) : null}
      {formError && !formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {formError}
        </Alert>
      ) : null}

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

      <SiteCategoryFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isNameInvalid={isNameInvalid}
        saving={saving}
        uploadingImage={uploadingImage}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
        onImageChange={handleImageChange}
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
