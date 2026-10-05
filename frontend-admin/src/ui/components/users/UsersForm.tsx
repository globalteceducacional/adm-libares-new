import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type { CreateUserRequest, UpdateUserProfileRequest } from "../../../types/users";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
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

export type CreateUserFormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  acervoId: string;
  status: string;
};

type UsersFormProps = {
  mode: "create" | "edit";
  form: CreateUserFormState;
  inModal?: boolean;
  saving: boolean;
  isFormInvalid: boolean;
  showValidation: boolean;
  schoolLabel: string | null;
  acervoOptions: AcervoOptionResponse[];
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: CreateUserFormState) => void;
};

export function UsersForm({
  mode,
  form,
  inModal = false,
  saving,
  isFormInvalid,
  showValidation,
  schoolLabel,
  acervoOptions,
  onSubmit,
  onReset,
  onChange
}: UsersFormProps) {
  const isCreate = mode === "create";
  const disabled = saving;

  // Touched state for per-field blur validation
  const [touched, setTouched] = useState<Set<string>>(new Set());
  function touch(field: string) {
    setTouched((prev) => new Set(prev).add(field));
  }
  function showFieldError(field: string, invalid: boolean) {
    return invalid && (showValidation || touched.has(field));
  }

  const isNameInvalid = form.name.trim().length === 0;
  const isEmailInvalid = form.email.trim().length === 0;
  const isPhoneInvalid = form.phone.trim().length === 0;
  const passwordError =
    isCreate && form.password.length > 0 && form.password.length < 6
      ? "A senha deve ter no minimo 6 caracteres."
      : isCreate && showValidation && form.password.length === 0
        ? "A senha e obrigatoria."
        : undefined;

  const acervoSelectOptions = useMemo(
    () =>
      acervoOptions.map((acervo) => ({
        value: String(acervo.id),
        label: decodeHtmlEntities(acervo.name)
      })),
    [acervoOptions]
  );

  return (
    <FormGrid onSubmit={onSubmit}>
      {isCreate ? (
        <Field
          label="Contrato"
          hint="Opcional. Sem acervo o usuario fica sem contrato; o vinculo pode ser feito depois."
        >
          <Input
            type="text"
            value={
              form.acervoId
                ? schoolLabel ?? "Definida pelo acervo selecionado"
                : "Sem vinculo (pode definir depois)"
            }
            readOnly
            disabled
          />
        </Field>
      ) : schoolLabel ? (
        <Field label="Contrato">
          <Input type="text" value={schoolLabel} readOnly disabled />
        </Field>
      ) : null}

      <Field
        label="Nome"
        required
        error={showFieldError("name", isNameInvalid) ? "Informe o nome do usuario." : undefined}
      >
        <Input
          type="text"
          value={form.name}
          maxLength={150}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          onBlur={() => touch("name")}
          invalid={showFieldError("name", isNameInvalid)}
          disabled={disabled}
        />
      </Field>

      <Field
        label="Email"
        required
        error={showFieldError("email", isEmailInvalid) ? "Informe o email do usuario." : undefined}
      >
        <Input
          type="email"
          value={form.email}
          maxLength={190}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          onBlur={() => touch("email")}
          invalid={showFieldError("email", isEmailInvalid)}
          disabled={disabled}
        />
      </Field>

      {isCreate ? (
        <Field label="Senha" required error={passwordError}>
          <Input
            type="password"
            value={form.password}
            minLength={6}
            maxLength={100}
            autoComplete="new-password"
            onChange={(event) => onChange({ ...form, password: event.target.value })}
            onBlur={() => touch("password")}
            disabled={disabled}
            invalid={Boolean(passwordError)}
          />
        </Field>
      ) : null}

      <Field
        label="Telefone"
        required
        error={showFieldError("phone", isPhoneInvalid) ? "Informe o telefone do usuario." : undefined}
      >
        <Input
          type="text"
          value={form.phone}
          maxLength={40}
          onChange={(event) => onChange({ ...form, phone: event.target.value })}
          onBlur={() => touch("phone")}
          invalid={showFieldError("phone", isPhoneInvalid)}
          disabled={disabled}
        />
      </Field>

      {isCreate ? (
        <>
          <FormFullWidth>
            <Field
              label="Acervo"
              hint="Opcional. Sem acervo, vincule depois na ficha do usuario."
            >
              <SearchableSelect
                options={acervoSelectOptions}
                value={form.acervoId}
                onChange={(next) => onChange({ ...form, acervoId: next })}
                placeholder="Sem acervo por enquanto"
                searchPlaceholder="Buscar acervo..."
                emptyMessage="Nenhum acervo ativo cadastrado."
                allowEmpty
                emptyLabel="Sem acervo (vincular depois)"
                disabled={disabled}
              />
            </Field>
          </FormFullWidth>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(event) => onChange({ ...form, status: event.target.value })}
              disabled={disabled}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </Select>
          </Field>
        </>
      ) : null}

      <FormActions>
        <Button type="submit" disabled={disabled || isFormInvalid || Boolean(passwordError)}>
          {saving ? "Salvando..." : isCreate ? "Criar usuario" : "Salvar perfil"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}

export function toCreateUserRequest(form: CreateUserFormState): CreateUserRequest {
  const acervoId = form.acervoId.trim() ? Number(form.acervoId) : null;
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    phone: form.phone.trim(),
    acervoId: acervoId != null && Number.isFinite(acervoId) && acervoId > 0 ? acervoId : null,
    status: form.status || "1"
  };
}

export function toUpdateUserProfileRequest(form: CreateUserFormState): UpdateUserProfileRequest {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim()
  };
}
