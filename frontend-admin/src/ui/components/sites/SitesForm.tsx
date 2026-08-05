import { motion } from "framer-motion";
import { useId, useMemo, type ChangeEvent, type FormEvent } from "react";
import type { UpsertSiteRequest } from "../../../types/sites";
import type { SiteAuthorResponse } from "../../../types/siteAuthors";
import type { SiteCategoryResponse } from "../../../types/siteCategories";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";
import { SearchableSelect } from "../form/SearchableSelect";
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
  const formId = useId();
  const categoriesLegendId = `${formId}-categories-legend`;
  const categoriesErrorId = `${formId}-categories-error`;
  const authorId = `${formId}-author`;
  const authorErrorId = `${formId}-author-error`;
  const titleId = `${formId}-title`;
  const titleErrorId = `${formId}-title-error`;
  const descriptionId = `${formId}-description`;
  const descriptionErrorId = `${formId}-description-error`;
  const coverId = `${formId}-cover`;
  const coverErrorId = `${formId}-cover-error`;
  const fileTypeId = `${formId}-file-type`;
  const fileUrlId = `${formId}-file-url`;
  const fileLocalId = `${formId}-file-local`;
  const fileErrorId = `${formId}-file-error`;
  const statusId = `${formId}-status`;

  const categoryItems = useMemo(
    () =>
      categoryOptions.map((category) => ({
        id: category.id,
        label: decodeHtmlEntities(category.name)
      })),
    [categoryOptions]
  );
  const authorSelectOptions = useMemo(
    () =>
      authorOptions.map((author) => ({
        value: String(author.id),
        label: `${decodeHtmlEntities(author.name)} (#${author.id})`
      })),
    [authorOptions]
  );

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
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <fieldset className="form-field acervo-fieldset">
        <legend id={categoriesLegendId}>Categorias</legend>
        <SearchableCheckboxList
          items={categoryItems}
          selectedIds={form.categoryIds}
          onToggle={(id) =>
            onChange({
              ...form,
              categoryIds: toggleId(form.categoryIds, id)
            })
          }
          searchPlaceholder="Buscar categoria..."
          tall
          emptyMessage="Nenhuma categoria ativa cadastrada."
          invalid={isCategoriesInvalid}
          aria-labelledby={categoriesLegendId}
          aria-describedby={isCategoriesInvalid ? categoriesErrorId : undefined}
        />
        {isCategoriesInvalid ? (
          <small id={categoriesErrorId} role="alert" className="warning-text">
            Selecione ao menos uma categoria.
          </small>
        ) : null}
      </fieldset>

      <div className="form-field form-field--span-2">
        <span id={`${authorId}-label`}>Autor</span>
        <SearchableSelect
          id={authorId}
          options={authorSelectOptions}
          value={form.authorId > 0 ? String(form.authorId) : ""}
          onChange={(next) => onChange({ ...form, authorId: Number(next) || 0 })}
          placeholder="Selecione um autor"
          searchPlaceholder="Buscar autor por nome ou ID..."
          emptyMessage="Nenhum autor ativo cadastrado."
          allowEmpty
          emptyLabel="Selecione um autor"
          required
          invalid={isAuthorInvalid}
          aria-describedby={isAuthorInvalid ? authorErrorId : undefined}
        />
        {isAuthorInvalid ? (
          <small id={authorErrorId} role="alert" className="warning-text">
            Selecione um autor antes de salvar.
          </small>
        ) : null}
      </div>

      <label className="form-field" htmlFor={titleId}>
        <span>Titulo</span>
        <input
          id={titleId}
          type="text"
          value={form.title}
          maxLength={255}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          required
          aria-invalid={isTitleInvalid || undefined}
          aria-describedby={isTitleInvalid ? titleErrorId : undefined}
        />
        {isTitleInvalid ? (
          <small id={titleErrorId} role="alert" className="warning-text">
            Informe um titulo valido.
          </small>
        ) : null}
      </label>

      <label className="form-field form-field--full" htmlFor={descriptionId}>
        <span>Descricao</span>
        <textarea
          id={descriptionId}
          rows={6}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          required
          aria-invalid={isDescriptionInvalid || undefined}
          aria-describedby={isDescriptionInvalid ? descriptionErrorId : undefined}
        />
        {isDescriptionInvalid ? (
          <small id={descriptionErrorId} role="alert" className="warning-text">
            A descricao e obrigatoria.
          </small>
        ) : null}
      </label>

      <div className="form-field form-field--full">
        <label htmlFor={coverId}>
          <span>Capa</span>
        </label>
        <input
          id={coverId}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          disabled={isBusy}
          aria-invalid={isCoverInvalid || undefined}
          aria-describedby={isCoverInvalid ? coverErrorId : undefined}
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
        {isCoverInvalid ? (
          <small id={coverErrorId} role="alert" className="warning-text">
            Envie a imagem da capa.
          </small>
        ) : null}
      </div>

      <label className="form-field" htmlFor={fileTypeId}>
        <span>Tipo de arquivo</span>
        <select
          id={fileTypeId}
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
        <label className="form-field form-field--span-2" htmlFor={fileUrlId}>
          <span>URL do arquivo</span>
          <input
            id={fileUrlId}
            type="url"
            value={form.fileUrl ?? ""}
            onChange={(event) => onChange({ ...form, fileUrl: event.target.value })}
            placeholder="https://..."
            aria-invalid={isFileInvalid || undefined}
            aria-describedby={isFileInvalid ? fileErrorId : undefined}
          />
        </label>
      ) : (
        <div className="form-field form-field--span-2">
          <label htmlFor={fileLocalId}>
            <span>Arquivo (PDF ou EPUB)</span>
          </label>
          <input
            id={fileLocalId}
            type="file"
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            onChange={handleFileChange}
            disabled={isBusy}
            aria-invalid={isFileInvalid || undefined}
            aria-describedby={isFileInvalid ? fileErrorId : undefined}
          />
          {uploadingFile ? <small className="form-hint">Enviando arquivo...</small> : null}
          {form.fileUrl ? <small className="form-hint break-all">{form.fileUrl}</small> : null}
        </div>
      )}
      {isFileInvalid ? (
        <small id={fileErrorId} role="alert" className="warning-text form-field--full">
          {form.fileType === "server_url"
            ? "Informe a URL do arquivo."
            : "Envie o arquivo PDF ou EPUB."}
        </small>
      ) : null}

      <label className="form-field form-field--full acervo-checkbox-item">
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

      <label className="form-field" htmlFor={statusId}>
        <span>Status</span>
        <select
          id={statusId}
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
          disabled={isBusy}
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
