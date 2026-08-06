import type { FormEvent } from "react";
import { useId } from "react";
import { motion } from "framer-motion";
import type { UpsertSchoolRequest } from "../../../types/schools";

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
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const slugId = useId();
  const statusId = useId();

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <label className="form-field" htmlFor={nameId}>
        <span>Nome</span>
        <input
          id={nameId}
          type="text"
          value={form.name}
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
      <label className="form-field" htmlFor={slugId}>
        <span>Slug</span>
        <input
          id={slugId}
          type="text"
          value={form.slug ?? ""}
          onChange={(event) => onChange({ ...form, slug: event.target.value })}
        />
        <small className="hint-text">Opcional — gerado automaticamente se vazio</small>
      </label>
      <label className="form-field" htmlFor={statusId}>
        <span>Status</span>
        <select
          id={statusId}
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
        >
          <option value="1">Ativa</option>
          <option value="0">Inativa</option>
        </select>
      </label>
      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving}
        >
          {saving ? "Salvando..." : editingId ? "Salvar escola" : "Criar escola"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
