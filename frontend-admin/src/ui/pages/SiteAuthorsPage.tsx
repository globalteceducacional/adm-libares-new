import { motion } from "framer-motion";
import { Pencil, Plus, Power, Trash2, UserRound } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createSiteAuthor,
  deleteSiteAuthor,
  updateSiteAuthor,
  uploadSiteAuthorImage
} from "../../services/siteAuthorsService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSiteAuthorsQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { SiteAuthorFormModal } from "../components/siteAuthors/SiteAuthorFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { SiteAuthorResponse, UpsertSiteAuthorRequest } from "../../types/siteAuthors";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Button, ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertSiteAuthorRequest = {
  name: "",
  description: "",
  image: "",
  status: "1"
};

export function SiteAuthorsPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const authorsQuery = useSiteAuthorsQuery();
  const invalidate = useInvalidateAdminQueries();
  const authors = authorsQuery.data ?? [];
  const loading = authorsQuery.isLoading;
  const listingError = authorsQuery.error
    ? getQueryErrorMessage(authorsQuery.error, "Falha ao carregar autores do Site")
    : undefined;

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSiteAuthorRequest>(EMPTY_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const isNameInvalid = form.name.trim().length === 0;
  const canCreate = usePermission("sites.create");
  const canUpdate = usePermission("sites.update");
  const canDelete = usePermission("sites.delete");

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

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setFormError("");
    setUploadingImage(true);
    try {
      const response = await uploadSiteAuthorImage(file);
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
    setShowValidation(true);
    if (isNameInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const payload: UpsertSiteAuthorRequest = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        image: form.image?.trim() || undefined,
        status: form.status
      };
      if (editingId) {
        await updateSiteAuthor(editingId, payload);
        showToast("Autor do Site atualizado com sucesso.", "success");
      } else {
        await createSiteAuthor(payload);
        showToast("Autor do Site criado com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.siteAuthors();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar autor");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(author: SiteAuthorResponse) {
    setEditingId(author.id);
    setFormError("");
    setShowValidation(false);
    setForm({
      name: decodeHtmlEntities(author.name),
      description: stripHtml(author.description) ?? "",
      image: author.image ?? "",
      status: author.status
    });
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(author: SiteAuthorResponse) {
    if (!canUpdate) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateSiteAuthor(author.id, {
        name: author.name,
        description: author.description ?? undefined,
        image: author.image ?? undefined,
        status: "1"
      });
      showToast("Autor do Site ativado com sucesso.", "success");
      await invalidate.siteAuthors();
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
      await deleteSiteAuthor(authorId);
      if (editingId === authorId) {
        closeFormModal();
      }
      showToast("Autor do Site desativado com sucesso.", "success");
      await invalidate.siteAuthors();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar autor";
      setFormError(message);
      showToast(message, "error");
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

  const columns = useMemo<DataTableColumn<SiteAuthorResponse>[]>(
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
            {canUpdate ? (
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
            {canUpdate && author.status !== "1" ? (
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
            {canDelete && author.status === "1" ? (
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
    [saving, canUpdate, canDelete]
  );

  const listStats = useMemo(() => {
    const active = authors.filter((author) => author.status === "1").length;
    return [
      { label: "Total de autores", value: authors.length },
      { label: "Ativos", value: active },
      { label: "Exibidos", value: filteredAuthors.length, hint: "com filtros atuais" }
    ];
  }, [authors, filteredAuthors]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={UserRound}
          title="Autores do Site"
          description="Gerencie autores do catalogo Site, fotos e status para vincular aos conteudos."
          tone="success"
          actions={
            <PermissionGate permission="sites.create">
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

      <AdminListingSection<SiteAuthorResponse>
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

      <SiteAuthorFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isNameInvalid={showValidation && isNameInvalid}
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
