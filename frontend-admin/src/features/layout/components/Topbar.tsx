import { Bell, Menu } from "lucide-react";
import { Button } from "../../../shared/ui";
import { useAuth } from "../../auth/AuthContext";
import { SchoolContextSwitcher } from "../../tenant/SchoolContextSwitcher";
import { useLayoutStore } from "../../../stores/layoutStore";
import { Breadcrumbs, type BreadcrumbItem } from "../../../shared/ui/PageHeader";

type TopbarProps = {
  breadcrumbs: BreadcrumbItem[];
};

export function Topbar({ breadcrumbs }: TopbarProps) {
  const setMobileSidebarOpen = useLayoutStore((s) => s.setMobileSidebarOpen);
  const { user } = useAuth();
  const displayName = user?.name || user?.username || "Administrador";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            variant="icon"
            size="icon"
            className="border-violet-200 text-primary hover:bg-violet-50 lg:hidden dark:border-violet-900/40 dark:hover:bg-violet-950/40"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menu lateral"
          >
            <Menu size={18} />
          </Button>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground md:text-base">
              {displayName}
            </p>
            <div className="overflow-x-auto">
              <Breadcrumbs items={breadcrumbs} className="whitespace-nowrap text-xs sm:text-sm sm:whitespace-normal" />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SchoolContextSwitcher />
          <Button variant="icon" size="icon" aria-label="Notificacoes (em breve)" title="Notificacoes">
            <Bell size={18} />
          </Button>
          <div
            className="hidden h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-violet-600/25 sm:grid"
            aria-hidden
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
