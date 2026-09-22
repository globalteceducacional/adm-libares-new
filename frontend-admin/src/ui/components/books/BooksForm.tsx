import { Star } from "lucide-react";
import { useId, useMemo, type ChangeEvent, type FormEvent } from "react";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type {
  CategoryOptionResponse,
  HomeSectionOptionResponse,
  UpsertBookRequest
} from "../../../types/books";
import type { AuthorOptionResponse } from "../../../types/authors";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select,
  Textarea
} from "../../../shared/ui";
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
  const categoriesLegendId = `${formId}-categories-legend`;
  const acervosLegendId = `${formId}-acervos-legend`;
  const sectionsLegendId = `${formId}-sections-legend`;
  const isBusy = saving || uploadingCover || uploadingFile;

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
    <FormGrid onSubmit={onSubmit}>
      <Field
        label="Titulo"
        required
        error={isTitleInvalid ? "Informe um titulo valido." : undefined}
        className="sm:col-span-2"
      >
        <Input
          type="text"
          value={form.title}
          maxLength={100}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          invalid={isTitleInvalid}
          disabled={isBusy}
        />
      </Field>

      <FormFullWidth>
        <Field
          label="Autor"
          required
          error={isAuthorInvalid ? "Selecione um autor antes de salvar." : undefined}
          hint={
            form.authorId > 0 && !selectedAuthorExists
              ? "Autor atual nao esta ativo na lista. O vinculo sera preservado se voce salvar sem alterar este campo."
              : undefined
          }
        >
          <SearchableSelect
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
            disabled={isBusy}
          />
        </Field>
      </FormFullWidth>

      <FormFullWidth>
        <Field
          label={
            editingId
              ? "Capa do livro (enviar nova para substituir)"
              : "Capa do livro (obrigatoria)"
          }
          required={!editingId}
          error={isCoverInvalid ? "Envie a imagem da capa." : undefined}
          hint={
            uploadingCover
              ? "Enviando capa..."
              : form.bookCoverImage ||
                "Selecione um arquivo de imagem (JPG/PNG). O upload grava em /legacy/assets/images."
          }
        >
          <Input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleCoverChange}
            disabled={isBusy}
            invalid={isCoverInvalid}
          />
        </Field>
        {form.bookCoverImage ? (
          <div className="mt-2">
            <LegacyImage
              legacyPath={form.bookCoverImage}
              folder="images"
              alt="Pre-visualizacao da capa"
              className="book-form-cover"
              fallbackClassName="book-form-cover-placeholder"
              fallbackText="Capa indisponivel (arquivo nao encontrado no servidor)"
            />
          </div>
        ) : null}
      </FormFullWidth>

      <FormFullWidth>
        <p id={categoriesLegendId} className="mb-2 text-sm font-medium text-foreground">
          Categorias
        </p>
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
          disabled={isBusy}
        />
        {isCategoriesInvalid ? (
          <p className="mt-2 text-xs text-danger" role="alert">
            Selecione ao menos uma categoria.
          </p>
        ) : null}
      </FormFullWidth>

      <FormFullWidth>
        <p id={acervosLegendId} className="mb-2 text-sm font-medium text-foreground">
          Acervos
        </p>
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
          disabled={isBusy}
        />
        <p className="mt-2 text-xs text-muted">
          Selecione em quais acervos o livro ficara disponivel. Sem acervo, o livro nao aparece no
          app.
        </p>
        {isAcervosInvalid ? (
          <p className="mt-2 text-xs text-danger" role="alert">
            Selecione ao menos um acervo.
          </p>
        ) : null}
      </FormFullWidth>

      <FormFullWidth>
        <Field
          label="Descricao"
          required
          error={isDescriptionInvalid ? "A descricao e obrigatoria." : undefined}
        >
          <Textarea
            rows={6}
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            placeholder="Descricao do livro (aceita HTML como no legado)"
            invalid={isDescriptionInvalid}
            disabled={isBusy}
          />
        </Field>
      </FormFullWidth>

      <Field label="Tipo de arquivo">
        <Select
          value={form.fileType}
          onChange={(event) =>
            onChange({
              ...form,
              fileType: event.target.value as UpsertBookRequest["fileType"],
              fileUrl: event.target.value === "server_url" ? form.fileUrl ?? "" : form.fileUrl
            })
          }
          disabled={isBusy}
        >
          <option value="server_url">URL externa (server_url)</option>
          <option value="local">Arquivo local (PDF/EPUB)</option>
        </Select>
      </Field>

      {form.fileType === "server_url" ? (
        <Field
          label="URL do arquivo"
          className="sm:col-span-2"
          error={isFileInvalid ? "Informe a URL do arquivo do livro." : undefined}
        >
          <Input
            type="url"
            value={form.fileUrl ?? ""}
            onChange={(event) => onChange({ ...form, fileUrl: event.target.value })}
            placeholder="https://..."
            invalid={isFileInvalid}
            disabled={isBusy}
          />
        </Field>
      ) : (
        <FormFullWidth>
          <Field
            label="Arquivo do livro (PDF ou EPUB)"
            error={isFileInvalid ? "Envie o arquivo PDF ou EPUB do livro." : undefined}
            hint={uploadingFile ? "Enviando arquivo..." : form.fileUrl || undefined}
          >
            <Input
              type="file"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              onChange={handleBookFileChange}
              disabled={isBusy}
              invalid={isFileInvalid}
            />
          </Field>
        </FormFullWidth>
      )}

      <FormFullWidth>
        <p id={sectionsLegendId} className="mb-2 text-sm font-medium text-foreground">
          Secoes da home (opcional)
        </p>
        <SearchableCheckboxList
          items={sectionItems}
          selectedIds={form.sectionIds}
          onToggle={(id) =>
            onChange({
              ...form,
              sectionIds: toggleId(form.sectionIds, id)
            })
          }
          searchPlaceholder="Buscar secao..."
          emptyMessage="Nenhuma secao ativa cadastrada."
          aria-labelledby={sectionsLegendId}
          disabled={isBusy}
        />
      </FormFullWidth>

      <FormFullWidth>
        <label
          className={`featured-toggle flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-3${
            form.featured ? " is-checked" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => onChange({ ...form, featured: event.target.checked })}
            disabled={isBusy}
          />
          <Star
            size={18}
            className="featured-toggle__icon"
            aria-hidden
            fill={form.featured ? "currentColor" : "none"}
          />
          <span className="featured-toggle__copy">
            <strong>Destacar na home do app</strong>
            <small>Aparece no bloco de destaques da tela inicial do leitor.</small>
          </span>
        </label>
      </FormFullWidth>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={isBusy}
        >
          <option value="1">Ativo (1)</option>
          <option value="0">Inativo (0)</option>
        </Select>
      </Field>

      {uploadError ? (
        <FormFullWidth>
          <p className="text-sm text-danger" role="alert">
            {uploadError}
          </p>
        </FormFullWidth>
      ) : null}

      <FormActions>
        <Button type="submit" disabled={isBusy}>
          {saving ? "Salvando..." : editingId ? "Atualizar livro" : "Criar livro"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
