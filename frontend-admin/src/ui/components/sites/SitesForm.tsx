import { Star } from "lucide-react";
import { useId, useMemo, type ChangeEvent, type FormEvent } from "react";
import type { UpsertSiteRequest } from "../../../types/sites";
import type { SiteAuthorResponse } from "../../../types/siteAuthors";
import type { SiteCategoryResponse } from "../../../types/siteCategories";
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
    <FormGrid onSubmit={onSubmit}>
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
          emptyMessage="Nenhuma categoria ativa cadastrada."
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
        <Field
          label="Autor"
          required
          error={isAuthorInvalid ? "Selecione um autor antes de salvar." : undefined}
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

      <Field
        label="Titulo"
        required
        error={isTitleInvalid ? "Informe um titulo valido." : undefined}
        className="sm:col-span-2"
      >
        <Input
          type="text"
          value={form.title}
          maxLength={255}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          invalid={isTitleInvalid}
          disabled={isBusy}
        />
      </Field>

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
            invalid={isDescriptionInvalid}
            disabled={isBusy}
          />
        </Field>
      </FormFullWidth>

      <FormFullWidth>
        <Field
          label="Capa"
          error={isCoverInvalid ? "Envie a imagem da capa." : undefined}
          hint={uploadingCover ? "Enviando capa..." : form.coverImage || undefined}
        >
          <Input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            disabled={isBusy}
            invalid={isCoverInvalid}
          />
        </Field>
        {form.coverImage ? (
          <div className="mt-2">
            <LegacyImage
              legacyPath={form.coverImage}
              folder="images"
              alt="Pre-visualizacao da capa"
              className="book-form-cover"
              fallbackClassName="book-form-cover-placeholder"
              fallbackText="Capa indisponivel"
            />
          </div>
        ) : null}
      </FormFullWidth>

      <Field label="Tipo de arquivo">
        <Select
          value={form.fileType}
          onChange={(event) =>
            onChange({
              ...form,
              fileType: event.target.value === "local" ? "local" : "server_url"
            })
          }
          disabled={isBusy}
        >
          <option value="server_url">URL externa (server_url)</option>
          <option value="local">Arquivo local</option>
        </Select>
      </Field>

      {form.fileType === "server_url" ? (
        <Field
          label="URL do arquivo"
          className="sm:col-span-2"
          error={isFileInvalid ? "Informe a URL do arquivo." : undefined}
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
            label="Arquivo (PDF ou EPUB)"
            error={isFileInvalid ? "Envie o arquivo PDF ou EPUB." : undefined}
            hint={uploadingFile ? "Enviando arquivo..." : form.fileUrl || undefined}
          >
            <Input
              type="file"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              onChange={handleFileChange}
              disabled={isBusy}
              invalid={isFileInvalid}
            />
          </Field>
        </FormFullWidth>
      )}

      <FormFullWidth>
        <label
          className={`featured-toggle flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-3${
            form.featured === "1" ? " is-checked" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={form.featured === "1"}
            onChange={(event) =>
              onChange({
                ...form,
                featured: event.target.checked ? "1" : "0"
              })
            }
            disabled={isBusy}
          />
          <Star
            size={18}
            className="featured-toggle__icon"
            aria-hidden
            fill={form.featured === "1" ? "currentColor" : "none"}
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
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
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
          {saving ? "Salvando..." : editingId ? "Atualizar site" : "Criar site"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={isBusy}>
          Cancelar
        </Button>
      </FormActions>
    </FormGrid>
  );
}
