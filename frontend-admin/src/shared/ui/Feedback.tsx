import type { ReactNode } from "react";
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
    warning: "border-warning/30 bg-warning/10 text-warning"
  }[tone];

  return (
    <p className={cn("rounded-xl border px-3 py-2 text-sm font-medium", toneClass, className)} role="alert">
      {children}
    </p>
  );
}

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {hint && !error ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
