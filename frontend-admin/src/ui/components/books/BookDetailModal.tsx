import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../../shared/lib/stripHtml";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { BookResponse } from "../../../types/books";
import { LegacyImage } from "../LegacyImage";

type BookDetailModalProps = {
  book: BookResponse | null;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onEdit: (book: BookResponse) => void;
  onDelete: (book: BookResponse) => void;
};

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-primary underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}

export function BookDetailModal({
  book,
  open,
  saving = false,
  onClose,
  onEdit,
  onDelete
}: BookDetailModalProps) {
  if (!book) {
    return null;
  }

  const title = decodeHtmlEntities(book.title);
  const authorLabel = book.authorName
    ? `${decodeHtmlEntities(book.authorName)} (#${book.authorId})`
    : `#${book.authorId}`;
  const description = stripHtml(book.description);
  const fileUrl = book.fileUrl?.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={`Detalhes do livro #${book.id}`}
      size="xl"
      footer={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={saving} className="w-full sm:w-auto">
            Fechar
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              onEdit(book);
              onClose();
            }}
            disabled={saving}
          >
            <Pencil size={16} />
            Editar
          </Button>
          <Button
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => {
              onDelete(book);
              onClose();
            }}
            disabled={saving}
          >
            <Trash2 size={16} />
            Excluir
          </Button>
        </div>
      }
    >
      <div className="grid min-w-0 gap-5 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="flex justify-center sm:justify-start">
          <LegacyImage
            legacyPath={book.bookCoverImage}
            folder="images"
            alt={`Capa de ${title}`}
            className="book-detail-cover"
            fallbackClassName="book-detail-cover-placeholder"
            fallbackText="Sem capa"
          />
        </div>

        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <DetailField label="ID" value={`#${book.id}`} />
          <DetailField label="Status" value={<StatusBadge active={book.status === "1"} />} />
          <DetailField label="Titulo" value={title} className="sm:col-span-2" />
          <DetailField label="Autor" value={authorLabel} />
          <DetailField
            label="Acervos"
            value={
              book.acervos?.length ? (
                <span className="acervo-chip-list">
                  {book.acervos.map((acervo) => (
                    <span key={acervo.id} className="acervo-chip">
                      {decodeHtmlEntities(acervo.name)}
                    </span>
                  ))}
                </span>
              ) : (
                "Sem acervo vinculado"
              )
            }
            className="sm:col-span-2"
          />
          <DetailField label="Categoria" value={book.categoryId || "—"} />
          <DetailField
            label="Visualizacoes"
            value={(book.views ?? 0).toLocaleString("pt-BR")}
          />
          <DetailField label="Destaque" value={book.featured ? "Sim" : "Nao"} />
          <DetailField label="Avaliacao media" value={book.rateAvg && book.rateAvg !== "0" ? book.rateAvg : "—"} />
          <DetailField label="Total de avaliacoes" value={(book.totalRate ?? 0).toLocaleString("pt-BR")} />
          {book.fileType ? <DetailField label="Tipo de arquivo" value={book.fileType} /> : null}
          {fileUrl ? (
            <DetailField
              label="Arquivo / URL"
              value={<ExternalLink href={fileUrl}>{decodeHtmlEntities(fileUrl)}</ExternalLink>}
              className="sm:col-span-2"
            />
          ) : null}
          {book.bookCoverImage ? (
            <DetailField
              label="Arquivo da capa"
              value={decodeHtmlEntities(book.bookCoverImage)}
              className="sm:col-span-2"
            />
          ) : null}
        </dl>
      </div>

      {description ? (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Descricao</h3>
          <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">{description}</p>
        </div>
      ) : null}
    </Modal>
  );
}
