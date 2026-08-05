import type { FormEvent } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { UpsertHomeSectionRequest } from "../../../types/homeSections";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";

type BookOption = {
  id: number;
  title: string;
};

type HomeSectionsFormProps = {
  form: UpsertHomeSectionRequest;
  editingId: number | null;
  saving: boolean;
  isTitleInvalid: boolean;
  needsSchoolContext: boolean;
  booksLoading: boolean;
  activeBooks: BookOption[];
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertHomeSectionRequest) => void;
  onToggleBook: (bookId: number) => void;
};

export function HomeSectionsForm({
  form,
  editingId,
  saving,
  isTitleInvalid,
  needsSchoolContext,
  booksLoading,
  activeBooks,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onToggleBook
}: HomeSectionsFormProps) {
  const bookItems = useMemo(
    () =>
      activeBooks.map((book) => ({
        id: book.id,
        label: `#${book.id} ${decodeHtmlEntities(book.title)}`
      })),
    [activeBooks]
  );

  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <fieldset className="form-field acervo-fieldset">
        <legend>Identificacao</legend>
        <label className="form-field">
          <span>Titulo</span>
          <input
            type="text"
            value={form.title}
            maxLength={150}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            disabled={needsSchoolContext}
            required
          />
          {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
        </label>
        <label className="form-field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value })}
            disabled={needsSchoolContext}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend>Livros da seção</legend>
        {needsSchoolContext ? (
          <small className="form-hint">Selecione uma escola para listar livros disponiveis.</small>
        ) : booksLoading ? (
          <small className="form-hint">Carregando livros...</small>
        ) : (
          <SearchableCheckboxList
            items={bookItems}
            selectedIds={form.bookIds}
            onToggle={onToggleBook}
            searchPlaceholder="Buscar livro por titulo ou ID..."
            tall
            disabled={saving || needsSchoolContext}
            emptyMessage="Nenhum livro ativo disponivel no contexto atual."
          />
        )}
      </fieldset>

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving || needsSchoolContext}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar seção" : "Criar seção"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
