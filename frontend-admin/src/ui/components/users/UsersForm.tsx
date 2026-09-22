import type { FormEvent } from "react";
import { useMemo } from "react";
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
  schoolLabel,
  acervoOptions,
  onSubmit,
  onReset,
  onChange
}: UsersFormProps) {
  const isCreate = mode === "create";
  const disabled = saving;
  const passwordError =
    isCreate && form.password.length > 0 && form.password.length < 6
      ? "A senha deve ter no minimo 6 caracteres."
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
        <Field label="Escola" hint="Definida pelo acervo escolhido quando nao ha escola no topo.">
          <Input
            type="text"
            value={schoolLabel ?? "Definida automaticamente pelo acervo"}
            readOnly
            disabled
          />
        </Field>
      ) : schoolLabel ? (
        <Field label="Escola">
          <Input type="text" value={schoolLabel} readOnly disabled />
        </Field>
      ) : null}

      <Field label="Nome" required>
        <Input
          type="text"
          value={form.name}
          maxLength={150}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={disabled}
        />
      </Field>

      <Field label="Email" required>
        <Input
          type="email"
          value={form.email}
          maxLength={190}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
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
            disabled={disabled}
            invalid={Boolean(passwordError)}
          />
        </Field>
      ) : null}

      <Field label="Telefone" required>
        <Input
          type="text"
          value={form.phone}
          maxLength={40}
          onChange={(event) => onChange({ ...form, phone: event.target.value })}
          disabled={disabled}
        />
      </Field>

      {isCreate ? (
        <>
          <FormFullWidth>
            <Field label="Acervo" required>
              <SearchableSelect
                options={acervoSelectOptions}
                value={form.acervoId}
                onChange={(next) => onChange({ ...form, acervoId: next })}
                placeholder="Selecione um acervo"
                searchPlaceholder="Buscar acervo..."
                emptyMessage="Nenhum acervo ativo cadastrado."
                allowEmpty
                emptyLabel="Selecione um acervo"
                disabled={disabled}
                required
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
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    phone: form.phone.trim(),
    acervoId: Number(form.acervoId),
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
