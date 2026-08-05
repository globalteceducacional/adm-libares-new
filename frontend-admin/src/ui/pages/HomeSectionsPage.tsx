import { motion } from "framer-motion";
import { LayoutList, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createHomeSection,
  deleteHomeSection,
  updateHomeSection
} from "../../services/homeSectionsService";
import {
  getQueryErrorMessage,
  useBooksQuery,
  useHomeSectionsQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { useAuth } from "../../features/auth/AuthContext";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { HomeSectionDetailModal } from "../components/homeSections/HomeSectionDetailModal";
import { HomeSectionFormModal } from "../components/homeSections/HomeSectionFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { HomeSectionResponse, UpsertHomeSectionRequest } from "../../types/homeSections";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Button, ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertHomeSectionRequest = {
  title: "",
  bookIds: [],
  status: "1"
};

export function HomeSectionsPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const { requiresSchoolContext, schoolContextId } = useAuth();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const sectionsQuery = useHomeSectionsQuery();
  const booksQuery = useBooksQuery();
  const invalidate = useInvalidateAdminQueries();

  const sections = sectionsQuery.data ?? [];
  const books = booksQuery.data ?? [];
  const loading = sectionsQuery.isLoading;
  const listingError = sectionsQuery.error
    ? getQueryErrorMessage(sectionsQuery.error, "Falha ao carregar seções")
    : undefined;

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<HomeSectionResponse | null>(null);
  const [form, setForm] = useState<UpsertHomeSectionRequest>(EMPTY_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const canCreate = usePermission("books.create");
  const canUpdate = usePermission("books.update");
  const canDelete = usePermission("books.delete");
  const needsSchoolContext = requiresSchoolContext && !schoolContextId;
  const isTitleInvalid = form.title.trim().length === 0;

  const activeBooks = useMemo(
    () => books.filter((book) => book.status === "1"),
    [books]
  );

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
    setSelectedSection((current) => {
      if (!current) {
        return null;
      }
      return sections.find((item) => item.id === current.id) ?? null;
    });
  }, [sections]);

  function toggleBook(bookId: number) {
    setForm((current) => {
      const exists = current.bookIds.includes(bookId);
      return {
        ...current,
        bookIds: exists
          ? current.bookIds.filter((id) => id !== bookId)
          : [...current.bookIds, bookId]
      };
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (needsSchoolContext) {
      return;
    }
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
      const payload: UpsertHomeSectionRequest = {
        title: form.title.trim(),
        bookIds: [...form.bookIds],
        status: form.status
      };
      if (editingId) {
        await updateHomeSection(editingId, payload);
        showToast("Seção atualizada com sucesso.", "success");
      } else {
        await createHomeSection(payload);
        showToast("Seção criada com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.homeSections();
      await invalidate.homeSectionOptions();
      await invalidate.books();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar seção");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(section: HomeSectionResponse) {
    setEditingId(section.id);
    setFormError("");
    setShowValidation(false);
    setForm({
      title: decodeHtmlEntities(section.title),
      bookIds: [...section.bookIds],
      status: section.status
    });
    setSelectedSection(null);
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(section: HomeSectionResponse) {
    if (!canUpdate) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateHomeSection(section.id, {
        title: section.title,
        bookIds: [...section.bookIds],
        status: "1"
      });
      showToast("Seção ativada com sucesso.", "success");
      await invalidate.homeSections();
      await invalidate.homeSectionOptions();
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
      await deleteHomeSection(sectionId);
      if (editingId === sectionId) {
        closeFormModal();
      }
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
      }
      showToast("Seção desativada com sucesso.", "success");
      await invalidate.homeSections();
      await invalidate.homeSectionOptions();
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

  const columns = useMemo<DataTableColumn<HomeSectionResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (section) => section.id },
      { key: "title", label: "Titulo", render: (section) => decodeHtmlEntities(section.title) },
      {
        key: "books",
        label: "Livros",
        render: (section) => `${section.bookCount} livro(s)`
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
      {
        label: "Exibidas",
        value: filteredSections.length,
        hint: "com filtros atuais"
      }
    ];
  }, [sections, filteredSections]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={LayoutList}
          title="Seções"
          description="Gerencie seções da home e vincule livros do catalogo filtrado por escola."
          tone="primary"
          actions={
            <PermissionGate permission="books.create">
              <Button
                type="button"
                onClick={openCreateForm}
                disabled={saving || needsSchoolContext}
              >
                <Plus size={16} />
                Nova seção
              </Button>
            </PermissionGate>
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {needsSchoolContext ? (
        <Alert tone="warning" className="mb-3">
          Selecione uma escola no topo do painel para carregar livros e montar seções por tenant.
        </Alert>
      ) : null}
      {formError && !formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {formError}
        </Alert>
      ) : null}

      <AdminListingSection<HomeSectionResponse>
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
              <p className="text-sm text-muted">{section.bookCount} livro(s)</p>
              <StatusBadge active={section.status === "1"} />
            </div>
          </article>
        )}
      />

      <HomeSectionFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isTitleInvalid={showValidation && isTitleInvalid}
        needsSchoolContext={needsSchoolContext}
        booksLoading={booksQuery.isLoading}
        activeBooks={activeBooks}
        saving={saving}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
        onToggleBook={toggleBook}
      />

      <HomeSectionDetailModal
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
