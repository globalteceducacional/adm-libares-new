import { motion } from "framer-motion";
import type { FormEvent } from "react";
import type { UpsertBookRequest } from "../../../types/books";
import type { AuthorOptionResponse } from "../../../types/authors";

type BooksFormProps = {
  form: UpsertBookRequest;
  authorOptions: AuthorOptionResponse[];
  selectedAuthorExists: boolean;
  isAuthorInvalid: boolean;
  isTitleInvalid: boolean;
  isFormInvalid: boolean;
  editingId: number | null;
  saving: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertBookRequest) => void;
};

export function BooksForm({
  form,
  authorOptions,
  selectedAuthorExists,
  isAuthorInvalid,
  isTitleInvalid,
  isFormInvalid,
  editingId,
  saving,
  onSubmit,
  onReset,
  onChange
}: BooksFormProps) {
  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <label className="form-field">
        <span>Titulo</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          required
        />
        {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
      </label>
      <label className="form-field">
        <span>Autor</span>
        <select
          value={form.authorId}
          onChange={(event) => onChange({ ...form, authorId: Number(event.target.value) || 0 })}
          required
        >
          <option value={0}>Selecione um autor</option>
          {authorOptions.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name} (#{author.id})
            </option>
          ))}
        </select>
        {isAuthorInvalid ? <small className="warning-text">Selecione um autor antes de salvar.</small> : null}
        {form.authorId > 0 && !selectedAuthorExists ? (
          <small className="warning-text">
            Autor atual nao esta ativo na lista. O vinculo sera preservado se voce salvar sem alterar este campo.
          </small>
        ) : null}
      </label>
      <label className="form-field">
        <span>Status</span>
        <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })}>
          <option value="1">Ativo (1)</option>
          <option value="0">Inativo (0)</option>
        </select>
      </label>
      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving || isFormInvalid}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar livro" : "Criar livro"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          Limpar formulario
        </button>
      </div>
    </form>
  );
}
