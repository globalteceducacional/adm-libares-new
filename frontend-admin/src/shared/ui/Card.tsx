import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  elevated?: boolean;
  padding?: "none" | "md" | "lg";
};

const paddingMap = {
  none: "",
  md: "p-4 md:p-5",
  lg: "p-5 md:p-6"
};

export function Card({ className, elevated, padding = "md", children, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-surface",
        elevated && "shadow-card",
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export function CardHeader({
  className,
  title,
  description,
  actions
}: {
  className?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="text-base font-semibold text-foreground md:text-lg">{title}</h2>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div> : null}
    </div>
  );
}
