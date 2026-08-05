import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import type { UpsertAuthorRequest } from "../../../types/authors";
import { LegacyImage } from "../LegacyImage";

type AuthorsFormProps = {
  form: UpsertAuthorRequest;
  editingId: number | null;
  saving: boolean;
  uploadingImage: boolean;
  isNameInvalid: boolean;
  isFormInvalid: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertAuthorRequest) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function AuthorsForm({
  form,
  editingId,
  saving,
  uploadingImage,
  isNameInvalid,
  isFormInvalid,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onImageChange
}: AuthorsFormProps) {
  const isBusy = saving || uploadingImage;

  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <fieldset className="form-field acervo-fieldset">
        <legend>Identificacao</legend>
        <label className="form-field">
          <span>Nome</span>
          <input
            type="text"
            value={form.name}
            maxLength={255}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            required
          />
          {isNameInvalid ? <small className="warning-text">Informe um nome valido.</small> : null}
        </label>
        <label className="form-field">
          <span>Descricao</span>
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
          />
        </label>
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend>Midia</legend>
        <div className="form-field">
          <span>Foto do autor</span>
          <input type="file" accept="image/*" onChange={onImageChange} disabled={isBusy} />
          {uploadingImage ? <small className="form-hint">Enviando imagem...</small> : null}
          {form.image ? (
            <div className="book-cover-preview">
              <LegacyImage
                legacyPath={form.image}
                folder="images"
                alt="Pre-visualizacao da foto"
                className="table-avatar h-24 w-24"
                fallbackClassName="table-avatar-placeholder h-24 w-24"
                fallbackText={form.name.trim().charAt(0).toUpperCase() || "A"}
              />
              <small className="form-hint">{form.image}</small>
            </div>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend>Status</legend>
        <label className="form-field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value })}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </label>
      </fieldset>

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={isBusy}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar autor" : "Criar autor"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={isBusy}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
