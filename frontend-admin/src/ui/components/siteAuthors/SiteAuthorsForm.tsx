import type { ChangeEvent, FormEvent } from "react";
import { useId } from "react";
import { motion } from "framer-motion";
import type { UpsertSiteAuthorRequest } from "../../../types/siteAuthors";
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
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const descriptionId = useId();
  const statusId = useId();
  const imageId = useId();

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <fieldset className="form-field acervo-fieldset">
        <legend>Identificacao</legend>
        <label className="form-field" htmlFor={nameId}>
          <span>Nome</span>
          <input
            id={nameId}
            type="text"
            value={form.name}
            maxLength={255}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            required
            aria-invalid={isNameInvalid || undefined}
            aria-describedby={isNameInvalid ? nameErrorId : undefined}
          />
          {isNameInvalid ? (
            <small id={nameErrorId} role="alert" className="warning-text">
              Informe um nome valido.
            </small>
          ) : null}
        </label>
        <label className="form-field" htmlFor={descriptionId}>
          <span>Descricao</span>
          <textarea
            id={descriptionId}
            rows={4}
            value={form.description ?? ""}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
          />
        </label>
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend>Midia</legend>
        <div className="form-field">
          <label htmlFor={imageId}>
            <span>Foto do autor</span>
          </label>
          <input
            id={imageId}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            disabled={isBusy}
          />
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
        <label className="form-field" htmlFor={statusId}>
          <span>Status</span>
          <select
            id={statusId}
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
