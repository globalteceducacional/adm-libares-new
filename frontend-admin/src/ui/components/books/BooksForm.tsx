import { motion } from "framer-motion";
import { useId, useMemo, type ChangeEvent, type FormEvent } from "react";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type {
  CategoryOptionResponse,
  HomeSectionOptionResponse,
  UpsertBookRequest
} from "../../../types/books";
import type { AuthorOptionResponse } from "../../../types/authors";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";
import { SearchableSelect } from "../form/SearchableSelect";
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
  const formId = useId();
  const titleId = `${formId}-title`;
  const titleErrorId = `${formId}-title-error`;
  const authorId = `${formId}-author`;
  const authorErrorId = `${formId}-author-error`;
  const coverId = `${formId}-cover`;
  const coverErrorId = `${formId}-cover-error`;
  const categoriesLegendId = `${formId}-categories-legend`;
  const categoriesErrorId = `${formId}-categories-error`;
  const acervosLegendId = `${formId}-acervos-legend`;
  const acervosErrorId = `${formId}-acervos-error`;
  const descriptionId = `${formId}-description`;
  const descriptionErrorId = `${formId}-description-error`;
  const fileTypeId = `${formId}-file-type`;
  const fileUrlId = `${formId}-file-url`;
  const fileLocalId = `${formId}-file-local`;
  const fileErrorId = `${formId}-file-error`;
  const sectionsLegendId = `${formId}-sections-legend`;
  const statusId = `${formId}-status`;

  const categoryItems = useMemo(
    () =>
      categoryOptions.map((category) => ({
        id: category.id,
        label: decodeHtmlEntities(category.name)
      })),
    [categoryOptions]
  );
  const acervoItems = useMemo(
    () =>
      acervoOptions.map((acervo) => ({
        id: acervo.id,
        label: decodeHtmlEntities(acervo.name)
      })),
    [acervoOptions]
  );
  const sectionItems = useMemo(
    () =>
      homeSectionOptions.map((section) => ({
        id: section.id,
        label: decodeHtmlEntities(section.title)
      })),
    [homeSectionOptions]
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
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <label className="form-field form-field--span-2" htmlFor={titleId}>
        <span>Titulo</span>
        <input
          id={titleId}
          type="text"
          value={form.title}
          maxLength={100}
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

      <div className="form-field">
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
        {form.authorId > 0 && !selectedAuthorExists ? (
          <small className="warning-text">
            Autor atual nao esta ativo na lista. O vinculo sera preservado se voce salvar sem alterar este campo.
          </small>
        ) : null}
      </div>

      <div className="form-field form-field--full">
        <label htmlFor={coverId}>
          <span>Capa do livro {editingId ? "(enviar nova para substituir)" : "(obrigatoria)"}</span>
        </label>
        <input
          id={coverId}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleCoverChange}
          disabled={saving || uploadingCover}
          aria-invalid={isCoverInvalid || undefined}
          aria-describedby={isCoverInvalid ? coverErrorId : undefined}
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
        {isCoverInvalid ? (
          <small id={coverErrorId} role="alert" className="warning-text">
            Envie a imagem da capa.
          </small>
        ) : null}
      </div>

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
          emptyMessage="Nenhuma categoria cadastrada no legado."
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

      <fieldset className="form-field acervo-fieldset">
        <legend id={acervosLegendId}>Acervos</legend>
        <SearchableCheckboxList
          items={acervoItems}
          selectedIds={form.acervoIds}
          onToggle={(id) =>
            onChange({
              ...form,
              acervoIds: toggleId(form.acervoIds, id)
            })
          }
          searchPlaceholder="Buscar acervo..."
          emptyMessage="Nenhum acervo ativo cadastrado. Crie um acervo antes de publicar livros."
          invalid={isAcervosInvalid}
          aria-labelledby={acervosLegendId}
          aria-describedby={isAcervosInvalid ? acervosErrorId : undefined}
        />
        <small className="form-hint">
          Selecione em quais acervos o livro ficara disponivel. Sem acervo, o livro nao aparece no app.
        </small>
        {isAcervosInvalid ? (
          <small id={acervosErrorId} role="alert" className="warning-text">
            Selecione ao menos um acervo.
          </small>
        ) : null}
      </fieldset>

      <label className="form-field form-field--full" htmlFor={descriptionId}>
        <span>Descricao</span>
        <textarea
          id={descriptionId}
          rows={6}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          placeholder="Descricao do livro (aceita HTML como no legado)"
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

      <label className="form-field" htmlFor={fileTypeId}>
        <span>Tipo de arquivo</span>
        <select
          id={fileTypeId}
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
            <span>Arquivo do livro (PDF ou EPUB)</span>
          </label>
          <input
            id={fileLocalId}
            type="file"
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            onChange={handleBookFileChange}
            disabled={saving || uploadingFile}
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
            ? "Informe a URL do arquivo do livro."
            : "Envie o arquivo PDF ou EPUB do livro."}
        </small>
      ) : null}

      <fieldset className="form-field acervo-fieldset">
        <legend id={sectionsLegendId}>Seções da home (opcional)</legend>
        <SearchableCheckboxList
          items={sectionItems}
          selectedIds={form.sectionIds}
          onToggle={(id) =>
            onChange({
              ...form,
              sectionIds: toggleId(form.sectionIds, id)
            })
          }
          searchPlaceholder="Buscar seção..."
          emptyMessage="Nenhuma seção ativa cadastrada."
          aria-labelledby={sectionsLegendId}
        />
      </fieldset>

      <label className="form-field form-field--full acervo-checkbox-item">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(event) => onChange({ ...form, featured: event.target.checked })}
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
          <option value="1">Ativo (1)</option>
          <option value="0">Inativo (0)</option>
        </select>
      </label>

      {uploadError ? <p className="error-text form-field--full">{uploadError}</p> : null}

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving || uploadingCover || uploadingFile}
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
