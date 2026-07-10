import type { ReactNode } from "react";
import { PageHeader, type BreadcrumbItem } from "./PageHeader";
import { cn } from "../lib/cn";

type PageShellProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Wrapper padrao das paginas internas pos-redesign. */
export function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className
}: PageShellProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} actions={actions} />
      {children}
    </div>
  );
}
