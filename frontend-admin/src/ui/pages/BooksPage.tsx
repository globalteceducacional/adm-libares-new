import { motion } from "framer-motion";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createBook, deleteBook, updateBook, uploadBookCover, uploadBookFile } from "../../services/booksService";
import {
  getQueryErrorMessage,
  useAuthorOptionsQuery,
  useAcervoOptionsQuery,
  useBooksQuery,
  useCategoryOptionsQuery,
  useHomeSectionOptionsQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { BookFormModal } from "../components/books/BookFormModal";
import { BookDetailModal } from "../components/books/BookDetailModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerrySelect } from "../components/layout/BerrySelect";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import type { BookResponse, UpsertBookRequest } from "../../types/books";
import { EMPTY_BOOK_FORM } from "../../types/books";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { ConfirmDialog, StatusBadge, Button, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function BooksPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const [acervoFilter, setAcervoFilter] = useState<string>("all");
  const selectedAcervoId = acervoFilter === "all" ? undefined : Number(acervoFilter);
  const booksQuery = useBooksQuery(selectedAcervoId);
  const authorsQuery = useAuthorOptionsQuery();
  const acervosQuery = useAcervoOptionsQuery();
  const categoriesQuery = useCategoryOptionsQuery();
  const homeSectionsQuery = useHomeSectionOptionsQuery();
  const invalidate = useInvalidateAdminQueries();
  const { showToast } = useToast();
  const canCreateBook = usePermission("books.create");
  const canUpdateBook = usePermission("books.update");
  const canDeleteBook = usePermission("books.delete");
  const books = booksQuery.data ?? [];
  const authorOptions = authorsQuery.data ?? [];
  const acervoOptions = acervosQuery.data ?? [];
  const categoryOptions = categoriesQuery.data ?? [];
  const homeSectionOptions = homeSectionsQuery.data ?? [];
  const loading = booksQuery.isLoading;
  const listingError = booksQuery.error
    ? getQueryErrorMessage(booksQuery.error, "Falha ao buscar livros")
    : undefined;
  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null);
  const [form, setForm] = useState<UpsertBookRequest>(EMPTY_BOOK_FORM);

  const selectedAuthorExists = authorOptions.some((author) => author.id === form.authorId);
  const authorOptionsWithFallback =
    form.authorId > 0 && !selectedAuthorExists
      ? [
          ...authorOptions,
          {
            id: form.authorId,
            name: `⚠ Autor vinculado (inativo/indisponivel)`
          }
        ]
      : authorOptions;
  const isAuthorInvalid = form.authorId <= 0;
  const isTitleInvalid = form.title.trim().length === 0;
  const isAcervosInvalid = form.acervoIds.length === 0;
  const isCategoriesInvalid = form.categoryIds.length === 0;
  const isDescriptionInvalid = form.description.trim().length === 0;
  const isCoverInvalid = !editingId && !form.bookCoverImage;
  const isFileInvalid =
    form.fileType === "server_url"
      ? (form.fileUrl ?? "").trim().length === 0
      : !editingId && (form.fileUrl ?? "").trim().length === 0;
  const isFormInvalid =
    isAuthorInvalid ||
    isTitleInvalid ||
    isAcervosInvalid ||
    isCategoriesInvalid ||
    isDescriptionInvalid ||
    isCoverInvalid ||
    isFileInvalid;
  const formErrorMessage =
    formError ||
    (authorsQuery.error
      ? getQueryErrorMessage(authorsQuery.error, "Falha ao carregar autores")
      : acervosQuery.error
        ? getQueryErrorMessage(acervosQuery.error, "Falha ao carregar acervos")
        : categoriesQuery.error
          ? getQueryErrorMessage(categoriesQuery.error, "Falha ao carregar categorias")
          : homeSectionsQuery.error
            ? getQueryErrorMessage(homeSectionsQuery.error, "Falha ao carregar seções da home")
            : "");

  function resetForm() {
    setForm(EMPTY_BOOK_FORM);
    setEditingId(null);
    setUploadError("");
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

  function handleFormReset() {
    closeFormModal();
  }

  async function handleCoverSelected(file: File) {
    setUploadError("");
    setUploadingCover(true);
    try {
      const response = await uploadBookCover(file);
      setForm((current) => ({ ...current, bookCoverImage: response.filename }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao enviar capa";
      setUploadError(message);
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleBookFileSelected(file: File) {
    setUploadError("");
    setUploadingFile(true);
    try {
      const response = await uploadBookFile(file);
      setForm((current) => ({
        ...current,
        fileType: "local",
        fileUrl: response.fileUrl
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao enviar arquivo do livro";
      setUploadError(message);
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    clearSuccess();
    setSaving(true);

    try {
      if (editingId) {
        await updateBook(editingId, form);
        showToast("Livro atualizado com sucesso.", "success");
        showSuccess("Livro atualizado com sucesso.");
      } else {
        await createBook(form);
        showToast("Livro criado com sucesso.", "success");
        showSuccess("Livro criado com sucesso.");
      }
      closeFormModal();
      await invalidate.books();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Falha ao salvar livro";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(book: BookResponse) {
    setSelectedBook(null);
    setEditingId(book.id);
    setUploadError("");
    setFormError("");
    setForm({
      title: decodeHtmlEntities(book.title),
      authorId: book.authorId,
      status: book.status,
      acervoIds: book.acervos?.map((acervo) => acervo.id) ?? [],
      categoryIds: book.categoryIds ?? [],
      description: book.description ?? "",
      bookCoverImage: book.bookCoverImage ?? null,
      fileType: book.fileType === "local" ? "local" : "server_url",
      fileUrl: book.fileUrl ?? "",
      sectionIds: book.sectionIds ?? [],
      featured: book.featured ?? false
    });
    setFormModalOpen(true);
  }

  useEffect(() => {
    setSelectedBook((current) => {
      if (!current) {
        return null;
      }
      return books.find((book) => book.id === current.id) ?? null;
    });
  }, [books]);

  function handleSelectBook(book: BookResponse) {
    setSelectedBook(book);
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const bookId = confirmDeleteId;
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteBook(bookId);
      if (editingId === bookId) {
        closeFormModal();
      }
      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
      }
      showSuccess("Livro excluido com sucesso.");
      showToast("Livro excluido com sucesso.", "success");
      await invalidate.books();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Falha ao excluir livro";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
  }

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const byStatus = statusFilter === "all" || book.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(book.title).toLowerCase().includes(normalized) ||
        decodeHtmlEntities(book.authorName ?? "").toLowerCase().includes(normalized) ||
        String(book.id).includes(normalized);
      return byStatus && byText;
    });
  }, [books, search, statusFilter]);

  const tableEmptyMessage = useMemo(
    () =>
      `Nenhum livro encontrado para os filtros aplicados.${
        search || statusFilter !== "all" ? " Limpe os filtros para ver mais resultados." : ""
      }`,
    [search, statusFilter]
  );

  const listStats = useMemo(() => {
    const active = books.filter((book) => book.status === "1").length;
    return [
      { label: "Total cadastrados", value: books.length },
      { label: "Ativos", value: active },
      { label: "Inativos", value: books.length - active },
      {
        label: "Exibidos agora",
        value: filteredBooks.length,
        hint: "Com filtros aplicados"
      }
    ];
  }, [books, filteredBooks]);

  const columns = useMemo<DataTableColumn<BookResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (book) => book.id },
      {
        key: "cover",
        label: "Capa",
        render: (book) => (
          <LegacyImage
            legacyPath={book.bookCoverImage}
            folder="images"
            alt={`Capa de ${book.title}`}
            className="table-book-cover"
            fallbackClassName="table-book-cover-placeholder"
            fallbackText="Imagem indisponivel no legado"
          />
        )
      },
      { key: "title", label: "Titulo", render: (book) => decodeHtmlEntities(book.title) },
      {
        key: "author",
        label: "Autor",
        render: (book) =>
          book.authorName
            ? `${decodeHtmlEntities(book.authorName)} (#${book.authorId})`
            : `#${book.authorId}`
      },
      {
        key: "acervos",
        label: "Acervos",
        render: (book) =>
          book.acervos?.length ? (
            <span className="acervo-chip-list">
              {book.acervos.map((acervo) => (
                <span key={acervo.id} className="acervo-chip">
                  {decodeHtmlEntities(acervo.name)}
                </span>
              ))}
            </span>
          ) : (
            <span className="warning-text">Sem acervo</span>
          )
      },
      {
        key: "views",
        label: "Views",
        align: "right",
        render: (book) => (book.views ?? 0).toLocaleString("pt-BR")
      },
      {
        key: "status",
        label: "Status",
        render: (book) => <StatusBadge active={book.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (book) => (
          <TableRowActions>
            {canUpdateBook ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(book)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canDeleteBook ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(book.id)}
                disabled={saving}
                aria-label={`Excluir o livro ${decodeHtmlEntities(book.title)}`}
              >
                <Trash2 size={14} />
                Excluir
              </motion.button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [saving, canUpdateBook, canDeleteBook]
  );

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={BookOpen}
          title="Livros"
          description="Cadastre, edite e gerencie o catalogo de livros da plataforma."
          tone="primary"
          actions={
            <PermissionGate permission="books.create">
              <Button type="button" onClick={openCreateForm} disabled={saving}>
                <Plus size={16} />
                Novo livro
              </Button>
            </PermissionGate>
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      <AdminListingSection<BookResponse>
        title="Listagem de livros"
        success={success}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por titulo, autor ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        secondaryFilter={
          <BerrySelect
            label="Acervo"
            value={acervoFilter}
            aria-label="Filtrar por acervo"
            onChange={(event) => setAcervoFilter(event.target.value)}
          >
            <option value="all">Todos os acervos</option>
            {acervoOptions.map((acervo) => (
              <option key={acervo.id} value={acervo.id}>
                {decodeHtmlEntities(acervo.name)}
              </option>
            ))}
          </BerrySelect>
        }
        columns={columns}
        data={filteredBooks}
        loading={loading}
        keyExtractor={(book) => book.id}
        emptyMessage={tableEmptyMessage}
        countLabel={`${filteredBooks.length} livro(s) com o filtro atual`}
        error={listingError}
        onRowClick={handleSelectBook}
        renderMobileCard={(book) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={book.bookCoverImage}
                folder="images"
                alt={`Capa de ${book.title}`}
                className="book-card-cover"
                fallbackClassName="book-card-cover-placeholder"
                fallbackText="Imagem indisponivel"
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{book.id}</p>
              <h3>{decodeHtmlEntities(book.title)}</h3>
              <p className="book-card-author">
                {book.authorName
                  ? `${decodeHtmlEntities(book.authorName)} (#${book.authorId})`
                  : `Autor #${book.authorId}`}
              </p>
              <p className="book-card-author">
                {(book.views ?? 0).toLocaleString("pt-BR")} visualizacoes
              </p>
              <StatusBadge active={book.status === "1"} />
            </div>
            <div
              className="book-card-actions"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <TableRowActions>
                {canUpdateBook ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="table-btn icon"
                    type="button"
                    onClick={() => handleEdit(book)}
                    disabled={saving}
                  >
                    <Pencil size={14} />
                    Editar
                  </motion.button>
                ) : null}
                {canDeleteBook ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="table-btn danger icon"
                    type="button"
                    onClick={() => setConfirmDeleteId(book.id)}
                    disabled={saving}
                    aria-label={`Excluir o livro ${book.title}`}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </motion.button>
                ) : null}
              </TableRowActions>
            </div>
          </article>
        )}
      />

      <BookFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        authorOptions={authorOptionsWithFallback}
        acervoOptions={acervoOptions}
        categoryOptions={categoryOptions}
        homeSectionOptions={homeSectionOptions}
        selectedAuthorExists={selectedAuthorExists}
        isAuthorInvalid={isAuthorInvalid}
        isTitleInvalid={isTitleInvalid}
        isAcervosInvalid={isAcervosInvalid}
        isCategoriesInvalid={isCategoriesInvalid}
        isDescriptionInvalid={isDescriptionInvalid}
        isCoverInvalid={isCoverInvalid}
        isFileInvalid={isFileInvalid}
        isFormInvalid={isFormInvalid}
        saving={saving}
        uploadingCover={uploadingCover}
        uploadingFile={uploadingFile}
        uploadError={uploadError}
        error={formErrorMessage}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={handleFormReset}
        onFormChange={setForm}
        onCoverSelected={handleCoverSelected}
        onBookFileSelected={handleBookFileSelected}
      />

      <BookDetailModal
        book={selectedBook}
        open={selectedBook !== null}
        saving={saving}
        onClose={() => setSelectedBook(null)}
        onEdit={handleEdit}
        onDelete={(book) => setConfirmDeleteId(book.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir livro"
        description="Esta acao nao pode ser desfeita. Deseja realmente excluir este livro?"
        confirmLabel="Excluir"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
