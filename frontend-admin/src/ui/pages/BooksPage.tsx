import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { createBook, deleteBook, updateBook } from "../../services/booksService";
import {
  getQueryErrorMessage,
  useAuthorOptionsQuery,
  useBooksQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { BooksFormCard } from "../components/books/BooksFormCard";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { LegacyImage } from "../components/LegacyImage";
import type { BookResponse, UpsertBookRequest } from "../../types/books";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { type DataTableColumn } from "../components/table/DataTable";

export function BooksPage() {
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const booksQuery = useBooksQuery();
  const authorsQuery = useAuthorOptionsQuery();
  const invalidate = useInvalidateAdminQueries();
  const { showToast } = useToast();
  const books = booksQuery.data ?? [];
  const authorOptions = authorsQuery.data ?? [];
  const loading = booksQuery.isLoading;
  const listingError = booksQuery.error
    ? getQueryErrorMessage(booksQuery.error, "Falha ao buscar livros")
    : undefined;
  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertBookRequest>({
    title: "",
    authorId: 1,
    status: "1"
  });

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
  const isFormInvalid = isAuthorInvalid || isTitleInvalid;
  const formErrorMessage =
    formError ||
    (authorsQuery.error
      ? getQueryErrorMessage(authorsQuery.error, "Falha ao carregar autores")
      : "");

  function resetForm() {
    setForm({ title: "", authorId: 1, status: "1" });
    setEditingId(null);
  }

  function handleFormReset() {
    resetForm();
    clearSuccess();
    setFormError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    clearSuccess();
    setSaving(true);

    try {
      if (editingId) {
        await updateBook(editingId, form);
        resetForm();
        showSuccess("Livro atualizado com sucesso.");
      } else {
        await createBook(form);
        resetForm();
        showSuccess("Livro criado com sucesso.");
      }
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
    setEditingId(book.id);
    setForm({
      title: book.title,
      authorId: book.authorId,
      status: book.status
    });
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
        resetForm();
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
        book.title.toLowerCase().includes(normalized) ||
        (book.authorName ?? "").toLowerCase().includes(normalized) ||
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
      { key: "title", label: "Titulo", render: (book) => book.title },
      {
        key: "author",
        label: "Autor",
        render: (book) => (book.authorName ? `${book.authorName} (#${book.authorId})` : `#${book.authorId}`)
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
          <>
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
          </>
        )
      }
    ],
    [saving]
  );

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <BooksFormCard
        editingId={editingId}
        form={form}
        authorOptions={authorOptionsWithFallback}
        selectedAuthorExists={selectedAuthorExists}
        isAuthorInvalid={isAuthorInvalid}
        isTitleInvalid={isTitleInvalid}
        isFormInvalid={isFormInvalid}
        saving={saving}
        success={success}
        error={formErrorMessage}
        onSubmit={handleSubmit}
        onReset={handleFormReset}
        onFormChange={setForm}
      />

      <AdminListingSection<BookResponse>
        title="Listagem de livros"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por titulo, autor ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredBooks}
        loading={loading}
        keyExtractor={(book) => book.id}
        emptyMessage={tableEmptyMessage}
        countLabel={`${filteredBooks.length} livro(s) com o filtro atual`}
        error={listingError}
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
              <h3>{book.title}</h3>
              <p className="book-card-author">
                {book.authorName ? `${book.authorName} (#${book.authorId})` : `Autor #${book.authorId}`}
              </p>
              <StatusBadge active={book.status === "1"} />
            </div>
            <div className="book-card-actions">
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
            </div>
          </article>
        )}
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
    </motion.section>
  );
}
