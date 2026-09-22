import type { FormEvent } from "react";
import type { UpsertSchoolRequest } from "../../../types/schools";
import {
  Button,
  Field,
  FormActions,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";

type SchoolsFormProps = {
  form: UpsertSchoolRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertSchoolRequest) => void;
};

export function SchoolsForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  inModal = false,
  onSubmit,
  onReset,
  onChange
}: SchoolsFormProps) {
  return (
    <FormGrid onSubmit={onSubmit}>
      <Field
        label="Nome"
        required
        error={isNameInvalid ? "Informe um nome valido." : undefined}
        className="sm:col-span-2"
      >
        <Input
          type="text"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={saving}
          invalid={isNameInvalid}
        />
      </Field>

      <Field
        label="Slug"
        hint="Opcional — gerado automaticamente se vazio"
        className="sm:col-span-2"
      >
        <Input
          type="text"
          value={form.slug ?? ""}
          onChange={(event) => onChange({ ...form, slug: event.target.value })}
          disabled={saving}
        />
      </Field>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={saving}
        >
          <option value="1">Ativa</option>
          <option value="0">Inativa</option>
        </Select>
      </Field>

      <FormActions>
        <Button type="submit" disabled={saving || isNameInvalid}>
          {saving ? "Salvando..." : editingId ? "Salvar escola" : "Criar escola"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
