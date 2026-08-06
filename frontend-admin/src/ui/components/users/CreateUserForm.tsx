import type { ComponentProps } from "react";
import { UsersForm } from "./UsersForm";

export type { CreateUserFormState } from "./UsersForm";
export { toCreateUserRequest } from "./UsersForm";

type CreateUserFormProps = Omit<ComponentProps<typeof UsersForm>, "mode">;

/** Wrapper de compatibilidade — formulário unificado em UsersForm (mode=create). */
export function CreateUserForm(props: CreateUserFormProps) {
  return <UsersForm {...props} mode="create" />;
}
