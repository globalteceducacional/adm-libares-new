import { motion } from "framer-motion";
import { Pencil, Plus, Power, Trash2, UserRound } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createAuthor,
  deleteAuthor,
  updateAuthor,
  uploadAuthorImage
} from "../../services/authorsService";
import {
  getQueryErrorMessage,
  useAuthorsQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { AuthorDetailModal } from "../components/authors/AuthorDetailModal";
import { AuthorFormModal } from "../components/authors/AuthorFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { AuthorResponse, UpsertAuthorRequest } from "../../types/authors";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Button, ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertAuthorRequest = {
  name: "",
  description: "",
  image: "",
  status: "1"
};

export function AuthorsPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const authorsQuery = useAuthorsQuery();
  const invalidate = useInvalidateAdminQueries();
  const authors = authorsQuery.data ?? [];
  const loading = authorsQuery.isLoading;
  const listingError = authorsQuery.error
    ? getQueryErrorMessage(authorsQuery.error, "Falha ao carregar autores")
    : undefined;

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorResponse | null>(null);
  const [form, setForm] = useState<UpsertAuthorRequest>(EMPTY_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const isNameInvalid = form.name.trim().length === 0;
  const isFormInvalid = isNameInvalid;
  const canCreateAuthor = usePermission("books.create");
  const canUpdateAuthor = usePermission("books.update");
  const canDeleteAuthor = usePermission("books.delete");

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

  useEffect(() => {
    setSelectedAuthor((current) => {
      if (!current) {
        return null;
      }
      return authors.find((item) => item.id === current.id) ?? null;
    });
  }, [authors]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setFormError("");
    setUploadingImage(true);
    try {
      const response = await uploadAuthorImage(file);
      setForm((current) => ({ ...current, image: response.filename }));
    } catch (uploadError) {
      setFormError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId ? !canUpdateAuthor : !canCreateAuthor) {
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
      const payload: UpsertAuthorRequest = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        image: form.image?.trim() || undefined,
        status: form.status
      };
      if (editingId) {
        await updateAuthor(editingId, payload);
        showToast("Autor atualizado com sucesso.", "success");
      } else {
        await createAuthor(payload);
        showToast("Autor criado com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.authors();
      await invalidate.authorOptions();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar autor");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(author: AuthorResponse) {
    setEditingId(author.id);
    setFormError("");
    setShowValidation(false);
    setForm({
      name: decodeHtmlEntities(author.name),
      description: stripHtml(author.description) ?? "",
      image: author.image ?? "",
      status: author.status
    });
    setSelectedAuthor(null);
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(author: AuthorResponse) {
    if (!canUpdateAuthor) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateAuthor(author.id, {
        name: author.name,
        description: author.description ?? undefined,
        image: author.image ?? undefined,
        status: "1"
      });
      showToast("Autor ativado com sucesso.", "success");
      await invalidate.authors();
      await invalidate.authorOptions();
    } catch (activateError) {
      const message =
        activateError instanceof Error ? activateError.message : "Falha ao ativar autor";
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
    const authorId = confirmDeleteId;
    setFormError("");
    setSaving(true);
    try {
      await deleteAuthor(authorId);
      if (editingId === authorId) {
        closeFormModal();
      }
      if (selectedAuthor?.id === authorId) {
        setSelectedAuthor(null);
      }
      showToast("Autor desativado com sucesso.", "success");
      await invalidate.authors();
      await invalidate.authorOptions();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar autor");
      showToast(
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar autor",
        "error"
      );
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
  }

  const filteredAuthors = useMemo(() => {
    return authors.filter((author) => {
      const byStatus = statusFilter === "all" || author.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const description = stripHtml(author.description)?.toLowerCase() ?? "";
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(author.name).toLowerCase().includes(normalized) ||
        description.includes(normalized) ||
        String(author.id).includes(normalized);
      return byStatus && byText;
    });
  }, [authors, search, statusFilter]);

  const columns = useMemo<DataTableColumn<AuthorResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (author) => author.id },
      {
        key: "photo",
        label: "Foto",
        render: (author) => (
          <LegacyImage
            legacyPath={author.image}
            folder="images"
            alt={`Foto de ${decodeHtmlEntities(author.name)}`}
            className="table-avatar"
            fallbackClassName="table-avatar-placeholder"
            fallbackText={decodeHtmlEntities(author.name).charAt(0).toUpperCase()}
          />
        )
      },
      { key: "name", label: "Nome", render: (author) => decodeHtmlEntities(author.name) },
      {
        key: "status",
        label: "Status",
        render: (author) => <StatusBadge active={author.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (author) => (
          <TableRowActions>
            {canUpdateAuthor ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(author)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canUpdateAuthor && author.status !== "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleActivate(author)}
                disabled={saving}
              >
                <Power size={14} />
                Ativar
              </motion.button>
            ) : null}
            {canDeleteAuthor && author.status === "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(author.id)}
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
    [saving, canUpdateAuthor, canDeleteAuthor]
  );

  const listStats = useMemo(() => {
    const active = authors.filter((author) => author.status === "1").length;
    return [
      { label: "Total de autores", value: authors.length },
      { label: "Ativos", value: active },
      {
        label: "Exibidos",
        value: filteredAuthors.length,
        hint: "com filtros atuais"
      }
    ];
  }, [authors, filteredAuthors]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={UserRound}
          title="Autores"
          description="Gerencie autores do catalogo, fotos e status para vincular aos livros."
          tone="success"
          actions={
            <PermissionGate permission="books.create">
              <Button type="button" onClick={openCreateForm} disabled={saving}>
                <Plus size={16} />
                Novo autor
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

      <AdminListingSection<AuthorResponse>
        title="Listagem de autores"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, descricao ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredAuthors}
        loading={loading}
        keyExtractor={(author) => author.id}
        emptyMessage="Nenhum autor encontrado para os filtros aplicados."
        countLabel={`${filteredAuthors.length} autor(es) com o filtro atual`}
        error={listingError}
        onRowClick={setSelectedAuthor}
        renderMobileCard={(author) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={author.image}
                folder="images"
                alt={`Foto de ${decodeHtmlEntities(author.name)}`}
                className="table-avatar"
                fallbackClassName="table-avatar-placeholder"
                fallbackText={decodeHtmlEntities(author.name).charAt(0).toUpperCase()}
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{author.id}</p>
              <h3>{decodeHtmlEntities(author.name)}</h3>
              <StatusBadge active={author.status === "1"} />
            </div>
          </article>
        )}
      />

      <AuthorFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isNameInvalid={showValidation && isNameInvalid}
        isFormInvalid={isFormInvalid}
        saving={saving}
        uploadingImage={uploadingImage}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
        onImageChange={handleImageChange}
      />

      <AuthorDetailModal
        author={selectedAuthor}
        open={selectedAuthor !== null}
        saving={saving}
        canUpdate={canUpdateAuthor}
        canDelete={canDeleteAuthor}
        onClose={() => setSelectedAuthor(null)}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onDelete={(author) => setConfirmDeleteId(author.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar autor"
        description="O autor sera marcado como inativo. Deseja continuar?"
        confirmLabel="Desativar"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
