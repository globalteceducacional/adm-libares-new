import { motion } from "framer-motion";
import type { ChangeEvent, FormEvent } from "react";
import type { UpsertSiteRequest } from "../../../types/sites";
import type { SiteAuthorResponse } from "../../../types/siteAuthors";
import type { SiteCategoryResponse } from "../../../types/siteCategories";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { LegacyImage } from "../LegacyImage";

type SitesFormProps = {
  form: UpsertSiteRequest;
  authorOptions: SiteAuthorResponse[];
  categoryOptions: SiteCategoryResponse[];
  isAuthorInvalid: boolean;
  isTitleInvalid: boolean;
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
  onChange: (next: UpsertSiteRequest) => void;
  onCoverSelected: (file: File) => Promise<void>;
  onSiteFileSelected: (file: File) => Promise<void>;
};

function toggleId(current: number[], id: number): number[] {
  return current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
}

export function SitesForm({
  form,
  authorOptions,
  categoryOptions,
  isAuthorInvalid,
  isTitleInvalid,
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
  onSubmit,
  onReset,
  onChange,
  onCoverSelected,
  onSiteFileSelected
}: SitesFormProps) {
  const isBusy = saving || uploadingCover || uploadingFile;

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await onCoverSelected(file);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await onSiteFileSelected(file);
  }

  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <fieldset className="form-field acervo-fieldset">
        <legend>Categorias</legend>
        {categoryOptions.length === 0 ? (
          <small className="warning-text">Nenhuma categoria ativa cadastrada.</small>
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

      <label className="form-field">
        <span>Autor</span>
        <select
          value={form.authorId}
          onChange={(event) =>
            onChange({
              ...form,
              authorId: Number(event.target.value) || 0
            })
          }
          required
        >
          <option value={0}>Selecione um autor</option>
          {authorOptions.map((author) => (
            <option key={author.id} value={author.id}>
              {decodeHtmlEntities(author.name)} (#{author.id})
            </option>
          ))}
        </select>
        {isAuthorInvalid ? (
          <small className="warning-text">Selecione um autor antes de salvar.</small>
        ) : null}
      </label>

      <label className="form-field">
        <span>Titulo</span>
        <input
          type="text"
          value={form.title}
          maxLength={255}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          required
        />
        {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
      </label>

      <label className="form-field">
        <span>Descricao</span>
        <textarea
          rows={6}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          required
        />
        {isDescriptionInvalid ? (
          <small className="warning-text">A descricao e obrigatoria.</small>
        ) : null}
      </label>

      <div className="form-field">
        <span>Capa</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          disabled={isBusy}
        />
        {uploadingCover ? <small className="form-hint">Enviando capa...</small> : null}
        {form.coverImage ? (
          <div className="book-cover-preview">
            <LegacyImage
              legacyPath={form.coverImage}
              folder="images"
              alt="Pre-visualizacao da capa"
              className="book-form-cover"
              fallbackClassName="book-form-cover-placeholder"
              fallbackText="Capa indisponivel"
            />
            <small className="form-hint">{form.coverImage}</small>
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
              fileType: event.target.value === "local" ? "local" : "server_url"
            })
          }
        >
          <option value="server_url">URL externa (server_url)</option>
          <option value="local">Arquivo local</option>
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
          <span>Arquivo (PDF ou EPUB)</span>
          <input
            type="file"
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            onChange={handleFileChange}
            disabled={isBusy}
          />
          {uploadingFile ? <small className="form-hint">Enviando arquivo...</small> : null}
          {form.fileUrl ? <small className="form-hint break-all">{form.fileUrl}</small> : null}
        </div>
      )}
      {isFileInvalid ? (
        <small className="warning-text">
          {form.fileType === "server_url"
            ? "Informe a URL do arquivo."
            : "Envie o arquivo PDF ou EPUB."}
        </small>
      ) : null}

      <label className="form-field acervo-checkbox-item">
        <input
          type="checkbox"
          checked={form.featured === "1"}
          onChange={(event) =>
            onChange({
              ...form,
              featured: event.target.checked ? "1" : "0"
            })
          }
        />
        <span>Destaque na home (featured)</span>
      </label>

      <label className="form-field">
        <span>Status</span>
        <select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>
      </label>

      {uploadError ? <p className="error-text">{uploadError}</p> : null}

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={isBusy || isFormInvalid}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar site" : "Criar site"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={isBusy}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
