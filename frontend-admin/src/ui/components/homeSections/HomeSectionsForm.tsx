import type { FormEvent } from "react";
import { useId, useMemo } from "react";
import type { UpsertHomeSectionRequest } from "../../../types/homeSections";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";
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
  const booksLegendId = useId();
  const disabled = saving || needsSchoolContext;

  const bookItems = useMemo(
    () =>
      activeBooks.map((book) => ({
        id: book.id,
        label: `#${book.id} ${decodeHtmlEntities(book.title)}`
      })),
    [activeBooks]
  );

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
          maxLength={150}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          disabled={needsSchoolContext}
          invalid={isTitleInvalid}
        />
      </Field>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={needsSchoolContext}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Select>
      </Field>

      <FormFullWidth>
        <p id={booksLegendId} className="mb-2 text-sm font-medium text-foreground">
          Livros da secao
        </p>
        {needsSchoolContext ? (
          <p className="text-xs text-muted">Selecione uma escola para listar livros disponiveis.</p>
        ) : booksLoading ? (
          <p className="text-xs text-muted">Carregando livros...</p>
        ) : (
          <SearchableCheckboxList
            items={bookItems}
            selectedIds={form.bookIds}
            onToggle={onToggleBook}
            searchPlaceholder="Buscar livro por titulo ou ID..."
            tall
            disabled={disabled}
            emptyMessage="Nenhum livro ativo disponivel no contexto atual."
            aria-labelledby={booksLegendId}
          />
        )}
      </FormFullWidth>

      <FormActions>
        <Button type="submit" disabled={disabled || isTitleInvalid}>
          {saving ? "Salvando..." : editingId ? "Atualizar secao" : "Criar secao"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
