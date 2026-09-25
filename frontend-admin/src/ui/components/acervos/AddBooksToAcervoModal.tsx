import { useEffect, useMemo, useState } from "react";
import { getQueryErrorMessage, useBooksQuery } from "../../../features/shared/api/queries";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Alert, Button, Modal, TableSkeleton } from "../../../shared/ui";
import type { AcervoResponse } from "../../../types/acervos";
import { SearchableCheckboxList, type SearchableCheckboxItem } from "../form/SearchableCheckboxList";

type AddBooksToAcervoModalProps = {
  acervo: AcervoResponse;
  open: boolean;
  saving: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (bookIds: number[]) => void;
};

/**
 * Lista os livros do catalogo (ja filtrados pelo contrato no backend) que ainda
 * nao pertencem ao acervo e permite vincular varios de uma vez.
 */
export function AddBooksToAcervoModal({
  acervo,
  open,
  saving,
  error,
  onClose,
  onConfirm
}: AddBooksToAcervoModalProps) {
  // Busca todos os livros so enquanto o modal esta aberto.
  const booksQuery = useBooksQuery(undefined, { enabled: open });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
    }
  }, [open]);

  const items = useMemo<SearchableCheckboxItem[]>(() => {
    const books = booksQuery.data ?? [];
    return books
      .filter((book) => !book.acervos?.some((item) => item.id === acervo.id))
      .map((book) => ({
        id: book.id,
        label: decodeHtmlEntities(book.title),
        description: [
          book.authorName ? decodeHtmlEntities(book.authorName) : null,
          book.status === "1" ? null : "Inativo",
          book.acervos?.length
            ? `Acervos: ${book.acervos.map((item) => decodeHtmlEntities(item.name)).join(", ")}`
            : "Sem acervo"
        ]
          .filter(Boolean)
          .join(" · ")
      }));
  }, [booksQuery.data, acervo.id]);

  function toggle(bookId: number) {
    setSelectedIds((current) =>
      current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]
    );
  }

  const loadError = booksQuery.error
    ? getQueryErrorMessage(booksQuery.error, "Falha ao carregar livros")
    : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar livros ao acervo"
      description={`Selecione os livros que passarao a fazer parte de "${decodeHtmlEntities(acervo.name)}".`}
      size="xl"
      closeOnOverlayClick={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(selectedIds)} disabled={saving || selectedIds.length === 0}>
            {saving
              ? "Vinculando..."
              : selectedIds.length > 0
                ? `Adicionar ${selectedIds.length} livro(s)`
                : "Adicionar"}
          </Button>
        </>
      }
    >
      {booksQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : loadError ? (
        <Alert tone="danger">{loadError}</Alert>
      ) : (
        <SearchableCheckboxList
          items={items}
          selectedIds={selectedIds}
          onToggle={toggle}
          tall
          disabled={saving}
          searchPlaceholder="Buscar por titulo ou autor"
          emptyMessage="Todos os livros disponiveis ja estao neste acervo."
        />
      )}
      {error ? (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      ) : null}
    </Modal>
  );
}
