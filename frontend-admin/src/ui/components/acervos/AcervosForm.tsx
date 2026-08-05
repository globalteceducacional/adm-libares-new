import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { UpsertAcervoRequest } from "../../../types/acervos";

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
  isFormInvalid,
  inModal = false,
  onSubmit,
  onReset,
  onChange
}: AcervosFormProps) {
  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <fieldset className="form-field acervo-fieldset">
        <legend>Identificacao</legend>
        <label className="form-field">
          <span>Nome</span>
          <input
            type="text"
            value={form.name}
            maxLength={100}
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
          disabled={saving || isFormInvalid}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar acervo" : "Criar acervo"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
