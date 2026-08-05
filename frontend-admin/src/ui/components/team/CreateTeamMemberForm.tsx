import type { FormEvent } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SchoolResponse } from "../../../types/schools";
import type { CreateTeamMemberRequest, TeamRoleCode } from "../../../types/team";
import { BerrySelect } from "../layout/BerrySelect";
import { SearchableSelect } from "../form/SearchableSelect";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";

export type CreateTeamMemberFormState = {
  username: string;
  name: string;
  password: string;
  schoolId: string;
  roleCode: TeamRoleCode;
};

type CreateTeamMemberFormProps = {
  form: CreateTeamMemberFormState;
  saving: boolean;
  isSuperAdmin: boolean;
  needsSchoolContext: boolean;
  isFormInvalid: boolean;
  schoolOptions: SchoolResponse[];
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: CreateTeamMemberFormState) => void;
};

export function CreateTeamMemberForm({
  form,
  saving,
  isSuperAdmin,
  needsSchoolContext,
  isFormInvalid,
  schoolOptions,
  onSubmit,
  onReset,
  onChange
}: CreateTeamMemberFormProps) {
  const disabled = saving || needsSchoolContext;
  const schoolSelectOptions = useMemo(
    () =>
      schoolOptions.map((school) => ({
        value: String(school.id),
        label: decodeHtmlEntities(school.name)
      })),
    [schoolOptions]
  );

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <label className="form-field">
        <span>Usuario</span>
        <input
          type="text"
          value={form.username}
          maxLength={100}
          autoComplete="username"
          onChange={(event) => onChange({ ...form, username: event.target.value })}
          disabled={disabled}
          required
        />
      </label>
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
      <SearchableSelect
        label="Escola"
        options={schoolSelectOptions}
        value={form.schoolId}
        onChange={(next) => onChange({ ...form, schoolId: next })}
        placeholder="Selecione uma escola"
        searchPlaceholder="Buscar escola..."
        emptyMessage="Nenhuma escola disponivel."
        allowEmpty
        emptyLabel="Selecione uma escola"
        disabled={disabled || (!isSuperAdmin && schoolOptions.length <= 1)}
        required
      />
      {isSuperAdmin ? (
        <BerrySelect
          label="Perfil"
          value={form.roleCode}
          onChange={(event) =>
            onChange({ ...form, roleCode: event.target.value as TeamRoleCode })
          }
          disabled={disabled}
          required
        >
          <option value="SCHOOL_ADMIN">Admin da escola</option>
          <option value="PROFESSOR">Professor</option>
        </BerrySelect>
      ) : (
        <label className="form-field">
          <span>Perfil</span>
          <input type="text" value="Professor" disabled readOnly />
        </label>
      )}
      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={disabled}
        >
          {saving ? "Salvando..." : "Criar membro da equipe"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          Limpar formulario
        </button>
      </div>
      {isFormInvalid ? (
        <small className="warning-text form-field--full">
          Preencha usuario, nome, senha (min. 6) e escola.
        </small>
      ) : null}
    </form>
  );
}

export function toCreateTeamMemberRequest(form: CreateTeamMemberFormState): CreateTeamMemberRequest {
  return {
    username: form.username.trim(),
    name: form.name.trim(),
    password: form.password,
    schoolId: Number(form.schoolId),
    roleCode: form.roleCode
  };
}

export function buildInitialTeamMemberForm(
  isSuperAdmin: boolean,
  defaultSchoolId: number | null
): CreateTeamMemberFormState {
  return {
    username: "",
    name: "",
    password: "",
    schoolId: defaultSchoolId ? String(defaultSchoolId) : "",
    roleCode: isSuperAdmin ? "SCHOOL_ADMIN" : "PROFESSOR"
  };
}
