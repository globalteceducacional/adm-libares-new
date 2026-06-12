import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode
} from "react";
import { cn } from "../lib/cn";

export function Alert({
  tone = "danger",
  children,
  className
}: {
  tone?: "danger" | "success" | "warning";
  children: ReactNode;
  className?: string;
}) {
  const toneClass = {
    danger: "border-danger/30 bg-danger/10 text-danger",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-warning-strong"
  }[tone];

  // Sucesso usa um anuncio "polite" (status); erros/avisos sao "assertive" (alert).
  const isAssertive = tone !== "success";

  return (
    <p
      className={cn("rounded-xl border px-3 py-2 text-sm font-medium", toneClass, className)}
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
    >
      {children}
    </p>
  );
}

type FieldChildProps = {
  id?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function Field({
  label,
  hint,
  error,
  required,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const hintId = `${generatedId}-hint`;

  const child = isValidElement(children) ? (children as ReactElement<FieldChildProps>) : null;
  const controlId = child?.props.id ?? generatedId;

  const describedBy =
    [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean).join(" ") || undefined;

  // Injeta id/aria no controle para garantir a associacao label <-> input.
  const control = child
    ? cloneElement(child, {
        id: controlId,
        required: child.props.required ?? required,
        "aria-invalid": error ? true : child.props["aria-invalid"],
        "aria-describedby": describedBy ?? child.props["aria-describedby"]
      })
    : children;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label htmlFor={controlId} className="font-medium text-foreground">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {control}
      {error ? (
        <span id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
      {hint && !error ? (
        <span id={hintId} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
