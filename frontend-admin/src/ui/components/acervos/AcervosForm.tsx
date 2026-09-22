import type { FormEvent } from "react";
import type { UpsertAcervoRequest } from "../../../types/acervos";
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

type AcervosFormProps = {
  form: UpsertAcervoRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertAcervoRequest) => void;
};

export function AcervosForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  inModal = false,
  onSubmit,
  onReset,
  onChange
}: AcervosFormProps) {
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
        <Button type="submit" disabled={saving || isNameInvalid}>
          {saving ? "Salvando..." : editingId ? "Atualizar acervo" : "Criar acervo"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
