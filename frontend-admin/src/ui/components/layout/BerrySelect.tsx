import type { SelectHTMLAttributes } from "react";
import { cn } from "../../../shared/lib/cn";

type BerrySelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  wrapperClassName?: string;
};

export function BerrySelect({ label, className, wrapperClassName, id, ...props }: BerrySelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label className={cn("flex w-full flex-col gap-1.5 sm:w-auto", wrapperClassName)}>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      ) : null}
      <select
        id={selectId}
        className={cn(
          "berry-select h-10 w-full min-w-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "sm:min-w-[160px]",
          className
        )}
        {...props}
      />
    </label>
  );
}
