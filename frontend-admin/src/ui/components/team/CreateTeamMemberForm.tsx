import type { FormEvent } from "react";
import { useMemo } from "react";
import type { SchoolResponse } from "../../../types/schools";
import type { CreateTeamMemberRequest, TeamRoleCode } from "../../../types/team";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";
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
  inModal?: boolean;
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
  inModal = false,
  onSubmit,
  onReset,
  onChange
}: CreateTeamMemberFormProps) {
  const disabled = saving || needsSchoolContext;
  const passwordError =
    form.password.length > 0 && form.password.length < 6
      ? "A senha deve ter no minimo 6 caracteres."
      : undefined;
  const schoolSelectOptions = useMemo(
    () =>
      schoolOptions.map((school) => ({
        value: String(school.id),
        label: decodeHtmlEntities(school.name)
      })),
    [schoolOptions]
  );

  return (
    <FormGrid onSubmit={onSubmit}>
      <Field label="Usuario" required>
        <Input
          type="text"
          value={form.username}
          maxLength={100}
          autoComplete="username"
          onChange={(event) => onChange({ ...form, username: event.target.value })}
          disabled={disabled}
        />
      </Field>

      <Field label="Nome" required>
        <Input
          type="text"
          value={form.name}
          maxLength={150}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={disabled}
        />
      </Field>

      <Field label="Senha" required error={passwordError} className="sm:col-span-2">
        <Input
          type="password"
          value={form.password}
          minLength={6}
          maxLength={100}
          autoComplete="new-password"
          onChange={(event) => onChange({ ...form, password: event.target.value })}
          disabled={disabled}
          invalid={Boolean(passwordError)}
        />
      </Field>

      <FormFullWidth>
        <Field label="Escola" required>
          <SearchableSelect
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
        </Field>
      </FormFullWidth>

      {isSuperAdmin ? (
        <Field label="Perfil" required>
          <Select
            value={form.roleCode}
            onChange={(event) =>
              onChange({ ...form, roleCode: event.target.value as TeamRoleCode })
            }
            disabled={disabled}
          >
            <option value="SCHOOL_ADMIN">Admin da escola</option>
            <option value="PROFESSOR">Professor</option>
          </Select>
        </Field>
      ) : (
        <Field label="Perfil">
          <Input type="text" value="Professor" disabled readOnly />
        </Field>
      )}

      {isFormInvalid ? (
        <FormFullWidth>
          <p className="text-xs text-warning-strong" role="status">
            Preencha usuario, nome, senha (min. 6) e escola.
          </p>
        </FormFullWidth>
      ) : null}

      {needsSchoolContext ? (
        <FormFullWidth>
          <p className="text-xs text-warning-strong" role="status">
            Selecione uma escola no topo do painel para liberar o cadastro.
          </p>
        </FormFullWidth>
      ) : null}

      <FormActions>
        <Button
          type="submit"
          disabled={disabled || isFormInvalid || Boolean(passwordError)}
        >
          {saving ? "Salvando..." : "Criar membro da equipe"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
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
