import type { ChangeEvent, FormEvent } from "react";
import type { UpsertCategoryRequest } from "../../../types/categories";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";
import { LegacyImage } from "../LegacyImage";

type CategoriesFormProps = {
  form: UpsertCategoryRequest;
  editingId: number | null;
  saving: boolean;
  uploadingImage: boolean;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertCategoryRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function CategoriesForm({
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
}: CategoriesFormProps) {
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
          maxLength={50}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={isBusy}
          invalid={isNameInvalid}
        />
      </Field>

      <FormFullWidth>
        <Field
          label="Imagem da categoria"
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
              alt="Pre-visualizacao da imagem"
              className="table-avatar h-24 w-24"
              fallbackClassName="table-avatar-placeholder h-24 w-24"
              fallbackText={form.name.trim().charAt(0).toUpperCase() || "C"}
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
          {saving ? "Salvando..." : editingId ? "Atualizar categoria" : "Criar categoria"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={isBusy}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
