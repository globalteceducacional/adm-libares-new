import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../../../shared/ui";
import { cn } from "../../../shared/lib/cn";
import { useLayoutStore } from "../../../stores/layoutStore";
import { NAV_ITEMS } from "../config/navigation";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed, mobileOpen, onNavigate }: SidebarProps) {
  const toggleSidebarCollapsed = useLayoutStore((s) => s.toggleSidebarCollapsed);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[60] flex w-[280px] flex-col gap-5 border-r border-indigo-500/20 bg-gradient-to-b from-[#171b2e] to-[#111628] p-4 text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
        collapsed && "lg:w-[92px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      aria-label="Menu principal"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
            AL
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Libare Digital</p>
              <p className="truncate text-xs text-indigo-200/70">Admin Console</p>
            </div>
          ) : null}
        </div>
        <Button
          variant="icon"
          size="icon"
          className="hidden border-indigo-400/20 bg-white/5 text-indigo-100 hover:bg-white/10 lg:inline-flex"
          onClick={toggleSidebarCollapsed}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navegacao principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-active text-white shadow-sm"
                  : "text-indigo-100/80 hover:bg-white/5 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? "text-violet-300" : "text-indigo-200/80"} />
                {!collapsed ? (
                  <span className="truncate">{item.label}</span>
                ) : (
                  <span className="sr-only">{item.label}</span>
                )}
                {isActive ? (
                  <motion.span
                    layoutId="nav-active"
                    className="ml-auto hidden h-2 w-2 rounded-full bg-violet-300 lg:block"
                  />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed ? (
        <div className="rounded-xl border border-indigo-400/15 bg-white/5 p-3 text-xs text-indigo-100/80">
          Painel administrativo com foco em catalogo, usuarios e moderacao.
        </div>
      ) : null}
    </aside>
  );
}
