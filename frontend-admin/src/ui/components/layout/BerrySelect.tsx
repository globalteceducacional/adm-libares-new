import type { SelectHTMLAttributes } from "react";
import { cn } from "../../../shared/lib/cn";
import { Select } from "../../../shared/ui";

type BerrySelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  wrapperClassName?: string;
};

/** Select de filtro de listagem (label uppercase). Preferir Field+Select em forms. */
export function BerrySelect({ label, className, wrapperClassName, id, ...props }: BerrySelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label className={cn("flex w-full flex-col gap-1.5 sm:w-auto", wrapperClassName)}>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      ) : null}
      <Select
        id={selectId}
        className={cn("berry-select sm:min-w-[160px]", className)}
        {...props}
      />
    </label>
  );
}
