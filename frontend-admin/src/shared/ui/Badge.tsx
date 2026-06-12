import { cn } from "../lib/cn";

const toneMap = {
  default: "bg-surface-2 text-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  muted: "bg-surface-2 text-muted"
} as const;

export type BadgeProps = {
  tone?: keyof typeof toneMap;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ tone = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ active, activeLabel = "Ativo", inactiveLabel = "Inativo" }: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <Badge tone={active ? "success" : "danger"}>{active ? activeLabel : inactiveLabel}</Badge>
  );
}
