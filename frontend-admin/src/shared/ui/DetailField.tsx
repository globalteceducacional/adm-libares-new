import type { ReactNode } from "react";

export function DetailField({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}
