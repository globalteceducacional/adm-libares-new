import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import type { UpsertCategoryRequest } from "../../../types/categories";
import { LegacyImage } from "../LegacyImage";

type CategoriesFormProps = {
  form: UpsertCategoryRequest;
  editingId: number | null;
  saving: boolean;
  uploadingImage: boolean;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
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
  isFormInvalid,
  onSubmit,
  onReset,
  onChange,
  onImageChange
}: CategoriesFormProps) {
  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <label className="form-field">
        <span>Nome</span>
        <input
          type="text"
          value={form.name}
          maxLength={50}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          required
        />
        {isNameInvalid ? <small className="warning-text">Informe um nome valido.</small> : null}
      </label>
      <div className="form-field">
        <span>Imagem da categoria</span>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          disabled={saving || uploadingImage}
        />
        {uploadingImage ? <small className="form-hint">Enviando imagem...</small> : null}
        {form.image ? (
          <div className="book-cover-preview">
            <LegacyImage
              legacyPath={form.image}
              folder="images"
              alt="Pre-visualizacao da imagem"
              className="table-avatar h-24 w-24"
              fallbackClassName="table-avatar-placeholder h-24 w-24"
              fallbackText={form.name.trim().charAt(0).toUpperCase() || "C"}
            />
            <small className="form-hint">{form.image}</small>
          </div>
        ) : null}
      </div>
      <label className="form-field">
        <span>Status</span>
        <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })}>
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>
      </label>
      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving || uploadingImage || isFormInvalid}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar categoria" : "Criar categoria"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving || uploadingImage}>
          Limpar formulario
        </button>
      </div>
    </form>
  );
}
