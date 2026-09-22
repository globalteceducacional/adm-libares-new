import type { ChangeEvent, FormEvent } from "react";
import type { UpsertSiteAuthorRequest } from "../../../types/siteAuthors";
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
import { LegacyImage } from "../LegacyImage";

type SiteAuthorsFormProps = {
  form: UpsertSiteAuthorRequest;
  editingId: number | null;
  saving: boolean;
  uploadingImage: boolean;
  isNameInvalid: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertSiteAuthorRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SiteAuthorsForm({
  form,
  editingId,
  saving,
  uploadingImage,
  isNameInvalid,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onImageChange
}: SiteAuthorsFormProps) {
  const isBusy = saving || uploadingImage;

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
          maxLength={255}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={isBusy}
          invalid={isNameInvalid}
        />
      </Field>

      <FormFullWidth>
        <Field label="Descricao">
          <Textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            disabled={isBusy}
          />
        </Field>
      </FormFullWidth>

      <FormFullWidth>
        <Field
          label="Foto do autor"
          hint={uploadingImage ? "Enviando imagem..." : form.image || undefined}
        >
          <Input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            disabled={isBusy}
          />
        </Field>
        {form.image ? (
          <div className="mt-2">
            <LegacyImage
              legacyPath={form.image}
              folder="images"
              alt="Pre-visualizacao da foto"
              className="table-avatar h-24 w-24"
              fallbackClassName="table-avatar-placeholder h-24 w-24"
              fallbackText={form.name.trim().charAt(0).toUpperCase() || "A"}
            />
          </div>
        ) : null}
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

      <FormActions>
        <Button type="submit" disabled={isBusy || isNameInvalid}>
          {saving ? "Salvando..." : editingId ? "Atualizar autor" : "Criar autor"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={isBusy}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
