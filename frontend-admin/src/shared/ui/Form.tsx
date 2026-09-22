import {
  forwardRef,
  type FormEventHandler,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";
import { cn } from "../lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

/** Select nativo alinhado ao Input (ADR 0003). Usar com Field para label/erro. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, "aria-invalid": ariaInvalid, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
        "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid && "border-danger focus:border-danger focus:ring-danger/20",
        className
      )}
      {...props}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

type FormGridProps = {
  children: ReactNode;
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  id?: string;
};

/** Grid de campos para forms em modal/página (substitui .book-form). */
export function FormGrid({ children, className, onSubmit, id }: FormGridProps) {
  return (
    <form
      id={id}
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}
      onSubmit={onSubmit}
      noValidate
    >
      {children}
    </form>
  );
}

type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

/** Linha de ações do formulário (substitui .book-form-actions). */
export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("col-span-full flex flex-wrap items-center gap-2 pt-1", className)}>
      {children}
    </div>
  );
}

/** Campo que ocupa as duas colunas do FormGrid. */
export function FormFullWidth({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("col-span-full", className)}>{children}</div>;
}
