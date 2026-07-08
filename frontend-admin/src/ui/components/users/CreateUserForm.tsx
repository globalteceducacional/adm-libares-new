import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type { CreateUserRequest } from "../../../types/users";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";

export type CreateUserFormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  acervoId: string;
  status: string;
};

type CreateUserFormProps = {
  form: CreateUserFormState;
  saving: boolean;
  needsSchoolContext: boolean;
  isFormInvalid: boolean;
  acervoOptions: AcervoOptionResponse[];
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: CreateUserFormState) => void;
};

export function CreateUserForm({
  form,
  saving,
  needsSchoolContext,
  isFormInvalid,
  acervoOptions,
  onSubmit,
  onReset,
  onChange
}: CreateUserFormProps) {
  const disabled = saving || needsSchoolContext;

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <label className="form-field">
        <span>Nome</span>
        <input
          type="text"
          value={form.name}
          maxLength={150}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={disabled}
          required
        />
      </label>
      <label className="form-field">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          maxLength={190}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          disabled={disabled}
          required
        />
      </label>
      <label className="form-field">
        <span>Senha</span>
        <input
          type="password"
          value={form.password}
          minLength={6}
          maxLength={100}
          autoComplete="new-password"
          onChange={(event) => onChange({ ...form, password: event.target.value })}
          disabled={disabled}
          required
        />
        {form.password.length > 0 && form.password.length < 6 ? (
          <small className="warning-text">A senha deve ter no minimo 6 caracteres.</small>
        ) : null}
      </label>
      <label className="form-field">
        <span>Telefone</span>
        <input
          type="text"
          value={form.phone}
          maxLength={40}
          onChange={(event) => onChange({ ...form, phone: event.target.value })}
          disabled={disabled}
          required
        />
      </label>
      <label className="form-field">
        <span>Acervo</span>
        <select
          value={form.acervoId}
          onChange={(event) => onChange({ ...form, acervoId: event.target.value })}
          disabled={disabled}
          required
        >
          <option value="">Selecione um acervo</option>
          {acervoOptions.map((acervo) => (
            <option key={acervo.id} value={acervo.id}>
              {decodeHtmlEntities(acervo.name)}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Status</span>
        <select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={disabled}
        >
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
          disabled={disabled || isFormInvalid}
        >
          {saving ? "Salvando..." : "Criar usuario"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          Limpar formulario
        </button>
      </div>
    </form>
  );
}

export function toCreateUserRequest(form: CreateUserFormState): CreateUserRequest {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    phone: form.phone.trim(),
    acervoId: Number(form.acervoId),
    status: form.status || "1"
  };
}
