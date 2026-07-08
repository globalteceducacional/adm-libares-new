import { motion } from "framer-motion";
import { Pencil, Tags, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  uploadCategoryImage
} from "../../services/categoriesService";
import {
  getQueryErrorMessage,
  useCategoriesQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { CategoryDetailModal } from "../components/categories/CategoryDetailModal";
import { CategoriesForm } from "../components/categories/CategoriesForm";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { CategoryResponse, UpsertCategoryRequest } from "../../types/categories";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function CategoriesPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const categoriesQuery = useCategoriesQuery();
  const invalidate = useInvalidateAdminQueries();
  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isLoading;
  const listingError = categoriesQuery.error
    ? getQueryErrorMessage(categoriesQuery.error, "Falha ao carregar categorias")
    : undefined;

  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [form, setForm] = useState<UpsertCategoryRequest>({
    name: "",
    image: "",
    status: "1"
  });

  const isNameInvalid = form.name.trim().length === 0;
  const isFormInvalid = isNameInvalid;
  const canCreateCategory = usePermission("books.create");
  const canUpdateCategory = usePermission("books.update");
  const canDeleteCategory = usePermission("books.delete");

  function resetForm() {
    setForm({ name: "", image: "", status: "1" });
    setEditingId(null);
  }

  useEffect(() => {
    setSelectedCategory((current) => {
      if (!current) {
        return null;
      }
      return categories.find((item) => item.id === current.id) ?? null;
    });
  }, [categories]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setFormError("");
    setUploadingImage(true);
    try {
      const response = await uploadCategoryImage(file);
      setForm((current) => ({ ...current, image: response.filename }));
    } catch (uploadError) {
      setFormError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId ? !canUpdateCategory : !canCreateCategory) {
      setFormError("Sem permissao para esta acao.");
      return;
    }
    setFormError("");
    clearSuccess();
    setSaving(true);

    try {
      // Imagem vazia permitida como ""
      const payload: UpsertCategoryRequest = {
        name: form.name.trim(),
        image: form.image?.trim() ?? "",
        status: form.status
      };
      if (editingId) {
        await updateCategory(editingId, payload);
        resetForm();
        showSuccess("Categoria atualizada com sucesso.");
      } else {
        await createCategory(payload);
        resetForm();
        showSuccess("Categoria criada com sucesso.");
      }
      await invalidate.categories();
      await invalidate.categoryOptions();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar categoria");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: CategoryResponse) {
    setEditingId(category.id);
    setForm({
      name: decodeHtmlEntities(category.name),
      image: category.image ?? "",
      status: category.status
    });
    document.getElementById("category-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      await deleteCategory(categoryId);
      if (editingId === categoryId) {
        resetForm();
      }
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
      }
      showSuccess("Categoria desativada com sucesso.");
      await invalidate.categories();
      await invalidate.categoryOptions();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar categoria");
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

  const columns = useMemo<DataTableColumn<CategoryResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (category) => category.id },
      {
        key: "photo",
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
            {canUpdateCategory ? (
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
            {canDeleteCategory ? (
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
    [saving, canUpdateCategory, canDeleteCategory]
  );

  const listStats = useMemo(() => {
    const active = categories.filter((category) => category.status === "1").length;
    return [
      { label: "Total de categorias", value: categories.length },
      { label: "Ativas", value: active },
      {
        label: "Exibidas",
        value: filteredCategories.length,
        hint: "com filtros atuais"
      }
    ];
  }, [categories, filteredCategories]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Tags}
          title="Categorias"
          description="Gerencie categorias globais do catalogo, imagens e status para vincular aos livros."
          tone="success"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <PermissionGate permission={editingId ? "books.update" : "books.create"}>
        <BerryFormPanel
          id="category-form-section"
          icon={Tags}
          title={editingId ? "Editar categoria" : "Cadastrar nova categoria"}
          description="Preencha nome e imagem para organizar as categorias do catalogo."
        >
          <CategoriesForm
            form={form}
            editingId={editingId}
            saving={saving}
            uploadingImage={uploadingImage}
            isNameInvalid={isNameInvalid}
            isFormInvalid={isFormInvalid}
            onSubmit={handleSubmit}
            onReset={() => {
              resetForm();
              clearSuccess();
              setFormError("");
            }}
            onChange={setForm}
            onImageChange={handleImageChange}
          />
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

      <AdminListingSection<CategoryResponse>
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
        onRowClick={setSelectedCategory}
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

      <CategoryDetailModal
        category={selectedCategory}
        open={selectedCategory !== null}
        saving={saving}
        canUpdate={canUpdateCategory}
        canDelete={canDeleteCategory}
        onClose={() => setSelectedCategory(null)}
        onEdit={handleEdit}
        onDelete={(category) => setConfirmDeleteId(category.id)}
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
