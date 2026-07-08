import { motion } from "framer-motion";
import { LayoutList, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
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
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { HomeSectionResponse, UpsertHomeSectionRequest } from "../../types/homeSections";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, ConfirmDialog, StatusBadge } from "../../shared/ui";
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
  const { requiresSchoolContext, schoolContextId } = useAuth();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const sectionsQuery = useHomeSectionsQuery();
  const booksQuery = useBooksQuery();
  const invalidate = useInvalidateAdminQueries();

  const sections = sectionsQuery.data ?? [];
  const books = booksQuery.data ?? [];
  const loading = sectionsQuery.isLoading;
  const listingError = sectionsQuery.error
    ? getQueryErrorMessage(sectionsQuery.error, "Falha ao carregar secoes")
    : undefined;

  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertHomeSectionRequest>(EMPTY_FORM);

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
  }

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
    setFormError("");
    clearSuccess();
    setSaving(true);

    try {
      const payload: UpsertHomeSectionRequest = {
        title: form.title.trim(),
        bookIds: [...form.bookIds],
        status: form.status
      };
      if (editingId) {
        await updateHomeSection(editingId, payload);
        resetForm();
        showSuccess("Secao atualizada com sucesso.");
      } else {
        await createHomeSection(payload);
        resetForm();
        showSuccess("Secao criada com sucesso.");
      }
      await invalidate.homeSections();
      await invalidate.homeSectionOptions();
      await invalidate.books();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar secao");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(section: HomeSectionResponse) {
    setEditingId(section.id);
    setForm({
      title: decodeHtmlEntities(section.title),
      bookIds: [...section.bookIds],
      status: section.status
    });
    document.getElementById("home-section-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      await deleteHomeSection(sectionId);
      if (editingId === sectionId) {
        resetForm();
      }
      showSuccess("Secao desativada com sucesso.");
      await invalidate.homeSections();
      await invalidate.homeSectionOptions();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar secao");
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
      { label: "Total de secoes", value: sections.length },
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
          title="Secoes"
          description="Gerencie secoes da home e vincule livros do catalogo filtrado por escola."
          tone="primary"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {needsSchoolContext ? (
        <Alert tone="warning">
          Selecione uma escola no topo do painel para carregar livros e montar secoes por tenant.
        </Alert>
      ) : null}

      <PermissionGate permission={editingId ? "books.update" : "books.create"}>
        <BerryFormPanel
          id="home-section-form"
          icon={LayoutList}
          title={editingId ? "Editar secao" : "Cadastrar nova secao"}
          description="Defina o titulo, status e os livros que aparecem nesta secao da home."
        >
          <form className="book-form modern" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Titulo</span>
              <input
                type="text"
                value={form.title}
                maxLength={150}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                disabled={needsSchoolContext}
                required
              />
              {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
            </label>

            <label className="form-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                disabled={needsSchoolContext}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </label>

            <div className="form-field">
              <span>Livros da secao</span>
              {needsSchoolContext ? (
                <small className="form-hint">Selecione uma escola para listar livros disponiveis.</small>
              ) : booksQuery.isLoading ? (
                <small className="form-hint">Carregando livros...</small>
              ) : activeBooks.length === 0 ? (
                <small className="form-hint">Nenhum livro ativo disponivel no contexto atual.</small>
              ) : (
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-border bg-surface-2/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeBooks.map((book) => (
                    <label key={book.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 accent-primary"
                        checked={form.bookIds.includes(book.id)}
                        onChange={() => toggleBook(book.id)}
                        disabled={saving || needsSchoolContext}
                      />
                      <span>
                        <span className="font-medium">#{book.id}</span>{" "}
                        {decodeHtmlEntities(book.title)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <small className="form-hint">{form.bookIds.length} livro(s) selecionado(s)</small>
            </div>

            <div className="book-form-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="primary-btn"
                type="submit"
                disabled={saving || needsSchoolContext || isTitleInvalid}
              >
                {saving ? "Salvando..." : editingId ? "Atualizar secao" : "Criar secao"}
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

      <AdminListingSection<HomeSectionResponse>
        title="Listagem de secoes"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por titulo ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredSections}
        loading={loading}
        keyExtractor={(section) => section.id}
        emptyMessage="Nenhuma secao encontrada para os filtros aplicados."
        countLabel={`${filteredSections.length} secao(oes) com o filtro atual`}
        error={listingError}
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

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar secao"
        description="A secao sera marcada como inativa. Deseja continuar?"
        confirmLabel="Desativar"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
