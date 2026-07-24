import { motion } from "framer-motion";
import type { ChangeEvent, FormEvent } from "react";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type {
  CategoryOptionResponse,
  HomeSectionOptionResponse,
  UpsertBookRequest
} from "../../../types/books";
import type { AuthorOptionResponse } from "../../../types/authors";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { LegacyImage } from "../LegacyImage";

type BooksFormProps = {
  form: UpsertBookRequest;
  authorOptions: AuthorOptionResponse[];
  acervoOptions: AcervoOptionResponse[];
  categoryOptions: CategoryOptionResponse[];
  homeSectionOptions: HomeSectionOptionResponse[];
  selectedAuthorExists: boolean;
  isAuthorInvalid: boolean;
  isTitleInvalid: boolean;
  isAcervosInvalid: boolean;
  isCategoriesInvalid: boolean;
  isDescriptionInvalid: boolean;
  isCoverInvalid: boolean;
  isFileInvalid: boolean;
  isFormInvalid: boolean;
  editingId: number | null;
  saving: boolean;
  uploadingCover: boolean;
  uploadingFile: boolean;
  uploadError: string;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertBookRequest) => void;
  onCoverSelected: (file: File) => Promise<void>;
  onBookFileSelected: (file: File) => Promise<void>;
  inModal?: boolean;
};

function toggleId(current: number[], id: number): number[] {
  return current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
}

export function BooksForm({
  form,
  authorOptions,
  acervoOptions,
  categoryOptions,
  homeSectionOptions,
  selectedAuthorExists,
  isAuthorInvalid,
  isTitleInvalid,
  isAcervosInvalid,
  isCategoriesInvalid,
  isDescriptionInvalid,
  isCoverInvalid,
  isFileInvalid,
  isFormInvalid,
  editingId,
  saving,
  uploadingCover,
  uploadingFile,
  uploadError,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onCoverSelected,
  onBookFileSelected
}: BooksFormProps) {
  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await onCoverSelected(file);
    event.target.value = "";
  }

  async function handleBookFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await onBookFileSelected(file);
    event.target.value = "";
  }

  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <label className="form-field">
        <span>Titulo</span>
        <input
          type="text"
          value={form.title}
          maxLength={100}
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

      <fieldset className="form-field acervo-fieldset">
        <legend>Categorias</legend>
        {categoryOptions.length === 0 ? (
          <small className="warning-text">Nenhuma categoria cadastrada no legado.</small>
        ) : (
          <div className="acervo-checkbox-grid">
            {categoryOptions.map((category) => (
              <label key={category.id} className="acervo-checkbox-item">
                <input
                  type="checkbox"
                  checked={form.categoryIds.includes(category.id)}
                  onChange={() =>
                    onChange({
                      ...form,
                      categoryIds: toggleId(form.categoryIds, category.id)
                    })
                  }
                />
                <span>{decodeHtmlEntities(category.name)}</span>
              </label>
            ))}
          </div>
        )}
        {isCategoriesInvalid ? (
          <small className="warning-text">Selecione ao menos uma categoria.</small>
        ) : null}
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend>Acervos</legend>
        {acervoOptions.length === 0 ? (
          <small className="warning-text">
            Nenhum acervo ativo cadastrado. Crie um acervo antes de publicar livros.
          </small>
        ) : (
          <div className="acervo-checkbox-grid">
            {acervoOptions.map((acervo) => (
              <label key={acervo.id} className="acervo-checkbox-item">
                <input
                  type="checkbox"
                  checked={form.acervoIds.includes(acervo.id)}
                  onChange={() =>
                    onChange({
                      ...form,
                      acervoIds: toggleId(form.acervoIds, acervo.id)
                    })
                  }
                />
                <span>{decodeHtmlEntities(acervo.name)}</span>
              </label>
            ))}
          </div>
        )}
        <small className="form-hint">
          Selecione em quais acervos o livro ficara disponivel. Sem acervo, o livro nao aparece no app.
        </small>
        {isAcervosInvalid ? (
          <small className="warning-text">Selecione ao menos um acervo.</small>
        ) : null}
      </fieldset>

      <label className="form-field">
        <span>Descricao</span>
        <textarea
          rows={6}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          placeholder="Descricao do livro (aceita HTML como no legado)"
          required
        />
        {isDescriptionInvalid ? (
          <small className="warning-text">A descricao e obrigatoria.</small>
        ) : null}
      </label>

      <div className="form-field">
        <span>Capa do livro {editingId ? "(enviar nova para substituir)" : "(obrigatoria)"}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleCoverChange}
          disabled={saving || uploadingCover}
          aria-label="Upload da capa do livro"
        />
        <small className="form-hint">
          Selecione um arquivo de imagem (JPG/PNG). O upload grava em /legacy/assets/images.
        </small>
        {uploadingCover ? <small className="form-hint">Enviando capa...</small> : null}
        {form.bookCoverImage ? (
          <div className="book-cover-preview">
            <LegacyImage
              legacyPath={form.bookCoverImage}
              folder="images"
              alt="Pre-visualizacao da capa"
              className="book-form-cover"
              fallbackClassName="book-form-cover-placeholder"
              fallbackText="Capa indisponivel (arquivo nao encontrado no servidor)"
            />
            <small className="form-hint">{form.bookCoverImage}</small>
          </div>
        ) : null}
        {isCoverInvalid ? <small className="warning-text">Envie a imagem da capa.</small> : null}
      </div>

      <label className="form-field">
        <span>Tipo de arquivo</span>
        <select
          value={form.fileType}
          onChange={(event) =>
            onChange({
              ...form,
              fileType: event.target.value as UpsertBookRequest["fileType"],
              fileUrl: event.target.value === "server_url" ? form.fileUrl ?? "" : form.fileUrl
            })
          }
        >
          <option value="server_url">URL externa (server_url)</option>
          <option value="local">Arquivo local (PDF/EPUB)</option>
        </select>
      </label>

      {form.fileType === "server_url" ? (
        <label className="form-field">
          <span>URL do arquivo</span>
          <input
            type="url"
            value={form.fileUrl ?? ""}
            onChange={(event) => onChange({ ...form, fileUrl: event.target.value })}
            placeholder="https://..."
          />
        </label>
      ) : (
        <div className="form-field">
          <span>Arquivo do livro (PDF ou EPUB)</span>
          <input
            type="file"
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            onChange={handleBookFileChange}
            disabled={saving || uploadingFile}
          />
          {uploadingFile ? <small className="form-hint">Enviando arquivo...</small> : null}
          {form.fileUrl ? <small className="form-hint break-all">{form.fileUrl}</small> : null}
        </div>
      )}

      {isFileInvalid ? (
        <small className="warning-text">
          {form.fileType === "server_url"
            ? "Informe a URL do arquivo do livro."
            : "Envie o arquivo PDF ou EPUB do livro."}
        </small>
      ) : null}

      <fieldset className="form-field acervo-fieldset">
        <legend>Seções da home (opcional)</legend>
        {homeSectionOptions.length === 0 ? (
          <small className="form-hint">Nenhuma seção ativa cadastrada.</small>
        ) : (
          <div className="acervo-checkbox-grid">
            {homeSectionOptions.map((section) => (
              <label key={section.id} className="acervo-checkbox-item">
                <input
                  type="checkbox"
                  checked={form.sectionIds.includes(section.id)}
                  onChange={() =>
                    onChange({
                      ...form,
                      sectionIds: toggleId(form.sectionIds, section.id)
                    })
                  }
                />
                <span>{decodeHtmlEntities(section.title)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label className="form-field acervo-checkbox-item">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(event) => onChange({ ...form, featured: event.target.checked })}
        />
        <span>Destaque na home (featured)</span>
      </label>

      <label className="form-field">
        <span>Status</span>
        <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })}>
          <option value="1">Ativo (1)</option>
          <option value="0">Inativo (0)</option>
        </select>
      </label>

      {uploadError ? <p className="error-text">{uploadError}</p> : null}

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving || uploadingCover || uploadingFile || isFormInvalid}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar livro" : "Criar livro"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
