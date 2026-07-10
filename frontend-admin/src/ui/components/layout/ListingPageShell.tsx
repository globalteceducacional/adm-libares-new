import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "../../../shared/ui";

type ListingPageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  hero: ReactNode;
  stats?: ReactNode;
  children: ReactNode;
};

/** Layout Berry para paginas de listagem (hero + stats + conteudo). */
export function ListingPageShell({ breadcrumbs, hero, stats, children }: ListingPageShellProps) {
  return (
    <div className="listing-page space-y-4 md:space-y-5">
      {breadcrumbs.length > 1 ? (
        <Breadcrumbs items={breadcrumbs} className="text-xs sm:text-sm" />
      ) : null}
      {hero}
      {stats}
      {children}
    </div>
  );
}
