import { motion } from "framer-motion";
import { BookOpen, Link2Off, Plus, Power, PowerOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePermission } from "../../../features/auth/usePermission";
import {
  getQueryErrorMessage,
  useBooksQuery,
  useInvalidateAdminQueries
} from "../../../features/shared/api/queries";
import { useAdminListFilters } from "../../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../../hooks/useAdminMutation";
import { syncAcervoBooks } from "../../../services/acervosService";
import { toggleBookStatus } from "../../../services/booksService";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, ConfirmDialog, EmptyState, StatusBadge } from "../../../shared/ui";
import type { AcervoResponse, SyncAcervoBooksRequest } from "../../../types/acervos";
import type { BookResponse } from "../../../types/books";
import { AdminListingSection } from "../layout/AdminListingSection";
import { LegacyImage } from "../LegacyImage";
import type { DataTableColumn } from "../table/DataTable";
import { TableRowActions } from "../table/TableRowActions";
import { AddBooksToAcervoModal } from "./AddBooksToAcervoModal";

type AcervoBooksTabProps = {
  acervo: AcervoResponse;
};

type ToggleBookVariables = {
  book: BookResponse;
  nextStatus: "0" | "1";
};

export function AcervoBooksTab({ acervo }: AcervoBooksTabProps) {
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const booksQuery = useBooksQuery(acervo.id);
  const invalidate = useInvalidateAdminQueries();
  const books = booksQuery.data ?? [];

  const canManageAcervo = usePermission("acervos.update");
  const canToggleBookStatus = usePermission("books.toggle_status");
  const acervoActive = acervo.status === "1";

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [bookToRemove, setBookToRemove] = useState<BookResponse | null>(null);

  async function invalidateAfterSync() {
    await invalidate.books();
    await invalidate.acervos();
    await invalidate.acervoOptions();
  }

  const syncMutation = useAdminMutation<AcervoResponse, SyncAcervoBooksRequest>({
    mutationFn: (payload) => syncAcervoBooks(acervo.id, payload),
    successMessage: (_data, { add, remove }) =>
      add.length > 0
        ? `${add.length} livro(s) adicionado(s) ao acervo.`
        : `${remove.length} livro(s) removido(s) do acervo.`,
    errorFallback: "Falha ao atualizar livros do acervo",
    // Erro do "adicionar" aparece dentro do modal; do "remover" no Alert da listagem.
    toastError: false,
    invalidate: invalidateAfterSync,
    onSuccess: () => {
      setAddModalOpen(false);
      setAddError("");
      setRemoveError("");
      setBookToRemove(null);
    },
    onError: (error, { add }) => {
      if (add.length > 0) {
        setAddError(error.message);
      } else {
        setRemoveError(error.message);
        setBookToRemove(null);
      }
    }
  });

  const toggleMutation = useAdminMutation<BookResponse, ToggleBookVariables>({
    mutationFn: ({ book, nextStatus }) => toggleBookStatus(book.id, nextStatus),
    successMessage: (_data, { nextStatus }) =>
      nextStatus === "1" ? "Livro ativado com sucesso." : "Livro desativado com sucesso.",
    errorFallback: "Falha ao alterar status",
    invalidate: () => invalidate.books()
  });

  const saving = syncMutation.isPending || toggleMutation.isPending;

  const filteredBooks = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return books.filter((book) => {
      const byStatus = statusFilter === "all" || book.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(book.title).toLowerCase().includes(normalized) ||
        (book.authorName ? decodeHtmlEntities(book.authorName).toLowerCase().includes(normalized) : false) ||
        String(book.id).includes(normalized);
      return byStatus && byText;
    });
  }, [books, search, statusFilter]);

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
            alt={`Capa de ${decodeHtmlEntities(book.title)}`}
            className="table-book-cover"
            fallbackClassName="table-book-cover-placeholder"
            fallbackText="Sem capa"
          />
        )
      },
      { key: "title", label: "Título", render: (book) => decodeHtmlEntities(book.title) },
      {
        key: "author",
        label: "Autor",
        render: (book) => (book.authorName ? decodeHtmlEntities(book.authorName) : `#${book.authorId}`)
      },
      {
        key: "otherAcervos",
        label: "Outros acervos",
        render: (book) => {
          const others = book.acervos?.filter((item) => item.id !== acervo.id) ?? [];
          return others.length > 0 ? (
            <span className="acervo-chip-list">
              {others.map((item) => (
                <span key={item.id} className="acervo-chip">
                  {decodeHtmlEntities(item.name)}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-xs text-muted">Somente este</span>
          );
        }
      },
      {
        key: "status",
        label: "Status",
        render: (book) => <StatusBadge active={book.status === "1"} />
      },
      {
        key: "actions",
        label: "Ações",
        stopRowClick: true,
        render: (book) => {
          // Dica apenas visual: a lista de acervos vem filtrada pelo contrato, entao a
          // validacao definitiva ("livro ficaria sem acervo") e feita pelo backend.
          const maybeOnlyAcervo = (book.acervos?.length ?? 0) <= 1;
          return (
            <TableRowActions>
              {canToggleBookStatus ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="table-btn icon"
                  type="button"
                  onClick={() =>
                    toggleMutation.mutate({ book, nextStatus: book.status === "1" ? "0" : "1" })
                  }
                  disabled={saving}
                >
                  {book.status === "1" ? <PowerOff size={14} /> : <Power size={14} />}
                  {book.status === "1" ? "Desativar" : "Ativar"}
                </motion.button>
              ) : null}
              {canManageAcervo ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="table-btn danger icon"
                  type="button"
                  onClick={() => {
                    setRemoveError("");
                    setBookToRemove(book);
                  }}
                  disabled={saving}
                  title={
                    maybeOnlyAcervo
                      ? "Provavelmente e o unico acervo do livro; a remocao sera recusada nesse caso."
                      : undefined
                  }
                >
                  <Link2Off size={14} />
                  Remover
                </motion.button>
              ) : null}
            </TableRowActions>
          );
        }
      }
    ],
    [acervo.id, canManageAcervo, canToggleBookStatus, saving, toggleMutation]
  );

  const listingError = booksQuery.error
    ? getQueryErrorMessage(booksQuery.error, "Falha ao carregar livros do acervo")
    : removeError || undefined;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Livros que os leitores deste acervo veem no app.{" "}
          <Link to={`/livros?acervoId=${acervo.id}`} className="font-medium text-primary hover:underline">
            Ver em Livros
          </Link>
        </p>
        {canManageAcervo ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAddError("");
              setAddModalOpen(true);
            }}
            disabled={saving || !acervoActive}
            title={!acervoActive ? "Ative o acervo para vincular livros." : undefined}
          >
            <Plus size={16} />
            Adicionar livros
          </Button>
        ) : null}
      </div>

      <AdminListingSection<BookResponse>
        title="Livros do acervo"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por titulo, autor ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredBooks}
        loading={booksQuery.isLoading}
        keyExtractor={(book) => book.id}
        emptyMessage="Nenhum livro encontrado para os filtros aplicados."
        emptyState={
          !booksQuery.isLoading && books.length === 0 && !search.trim() && statusFilter === "all" ? (
            <EmptyState
              icon={BookOpen}
              title="Este acervo ainda nao tem livros"
              description={
                acervoActive
                  ? "Os leitores vinculados verao um catalogo vazio ate que voce adicione livros."
                  : "Ative o acervo para poder vincular livros."
              }
              action={
                canManageAcervo && acervoActive
                  ? {
                      label: "Adicionar livros",
                      icon: Plus,
                      onClick: () => {
                        setAddError("");
                        setAddModalOpen(true);
                      }
                    }
                  : undefined
              }
              secondaryAction={{ label: "Cadastrar um livro novo", to: "/livros" }}
            />
          ) : undefined
        }
        countLabel={`${filteredBooks.length} de ${books.length} livro(s)`}
        error={listingError}
        renderMobileCard={(book) => (
          <article className="book-card">
            <LegacyImage
              legacyPath={book.bookCoverImage}
              folder="images"
              alt={`Capa de ${decodeHtmlEntities(book.title)}`}
              className="book-card-cover"
              fallbackClassName="book-card-cover-placeholder"
              fallbackText="Sem capa"
            />
            <div className="book-card-body">
              <p className="book-card-id">#{book.id}</p>
              <h3>{decodeHtmlEntities(book.title)}</h3>
              <p className="book-card-author">
                <BookOpen size={12} className="mr-1 inline" />
                {book.authorName ? decodeHtmlEntities(book.authorName) : `Autor #${book.authorId}`}
              </p>
              <StatusBadge active={book.status === "1"} />
            </div>
          </article>
        )}
      />

      <AddBooksToAcervoModal
        acervo={acervo}
        open={addModalOpen}
        saving={syncMutation.isPending}
        error={addError}
        onClose={() => {
          if (!syncMutation.isPending) {
            setAddModalOpen(false);
            setAddError("");
          }
        }}
        onConfirm={(bookIds) => syncMutation.mutate({ add: bookIds, remove: [] })}
      />

      <ConfirmDialog
        open={bookToRemove !== null}
        title="Remover livro do acervo"
        description={
          bookToRemove
            ? `"${decodeHtmlEntities(bookToRemove.title)}" deixara de aparecer para os leitores deste acervo. O livro continua no catalogo e nos outros acervos.`
            : undefined
        }
        confirmLabel="Remover"
        loading={syncMutation.isPending}
        onConfirm={() => {
          if (bookToRemove) {
            syncMutation.mutate({ add: [], remove: [bookToRemove.id] });
          }
        }}
        onCancel={() => setBookToRemove(null)}
      />
    </>
  );
}
