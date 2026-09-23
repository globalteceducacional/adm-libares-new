import type { FormEvent } from "react";
import { useMemo } from "react";
import type { UpsertAcervoRequest } from "../../../types/acervos";
import type { SchoolResponse } from "../../../types/schools";
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
import { SearchableSelect } from "../form/SearchableSelect";

type AcervosFormProps = {
  form: UpsertAcervoRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  isSchoolInvalid: boolean;
  isFormInvalid: boolean;
  inModal?: boolean;
  schoolOptions: SchoolResponse[];
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertAcervoRequest) => void;
};

export function AcervosForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  isSchoolInvalid,
  inModal = false,
  schoolOptions,
  onSubmit,
  onReset,
  onChange
}: AcervosFormProps) {
  const schoolSelectOptions = useMemo(
    () =>
      schoolOptions.map((school) => ({
        value: String(school.id),
        label: decodeHtmlEntities(school.name)
      })),
    [schoolOptions]
  );

  return (
    <FormGrid onSubmit={onSubmit}>
      <FormFullWidth>
        <Field
          label="Escola"
          required
          error={isSchoolInvalid ? "Selecione a escola do acervo." : undefined}
          hint="Obrigatoria. Define a qual escola este acervo pertence."
        >
          <SearchableSelect
            options={schoolSelectOptions}
            value={form.schoolId != null ? String(form.schoolId) : ""}
            onChange={(next) =>
              onChange({
                ...form,
                schoolId: next ? Number(next) : null
              })
            }
            placeholder="Selecione uma escola"
            searchPlaceholder="Buscar escola..."
            emptyMessage="Nenhuma escola cadastrada."
            allowEmpty
            emptyLabel="Selecione uma escola"
            disabled={saving}
            required
            invalid={isSchoolInvalid}
          />
        </Field>
      </FormFullWidth>

      <Field
        label="Nome"
        required
        error={isNameInvalid ? "Informe um nome valido." : undefined}
        className="sm:col-span-2"
      >
        <Input
          type="text"
          value={form.name}
          maxLength={100}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={saving}
          invalid={isNameInvalid}
        />
      </Field>

      <FormFullWidth>
        <Field label="Descricao">
          <Textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            disabled={saving}
          />
        </Field>
      </FormFullWidth>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={saving}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Select>
      </Field>

      <FormActions>
        <Button type="submit" disabled={saving || isNameInvalid || isSchoolInvalid}>
          {saving ? "Salvando..." : editingId ? "Atualizar acervo" : "Criar acervo"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
