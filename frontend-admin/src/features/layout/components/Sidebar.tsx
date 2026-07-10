import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/ui";
import { cn } from "../../../shared/lib/cn";
import { useLayoutStore } from "../../../stores/layoutStore";
import { useNavigation } from "../hooks/useNavigation";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarSearch } from "./SidebarSearch";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed, mobileOpen, onNavigate }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const toggleSidebarCollapsed = useLayoutStore((s) => s.toggleSidebarCollapsed);
  const closeMobileSidebar = useLayoutStore((s) => s.closeMobileSidebar);
  const expandedGroups = useLayoutStore((s) => s.expandedGroups);
  const toggleGroupExpanded = useLayoutStore((s) => s.toggleGroupExpanded);
  const { groups, getBadge } = useNavigation(searchQuery);
  const showExpandedSidebar = !collapsed || mobileOpen;

  return (
    <aside
      className={cn(
        "berry-sidebar fixed inset-y-0 left-0 z-[60] flex max-h-[100dvh] flex-col border-r border-sidebar-border text-sidebar-foreground transition-[width,transform] duration-300 lg:static lg:max-h-none",
        showExpandedSidebar ? "w-[min(280px,100vw)] px-4 py-4" : "w-[80px] px-2 py-4",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0 lg:shadow-none"
      )}
      aria-label="Menu principal"
    >
      <div
        className={cn(
          "berry-sidebar-brand flex items-center gap-3",
          !showExpandedSidebar && "flex-col border-b-0 pb-0"
        )}
      >
        <motion.span
          layout
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-sm font-bold text-white shadow-lg shadow-violet-900/40 ring-2 ring-white/10"
        >
          LD
        </motion.span>
        {showExpandedSidebar ? (
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold tracking-tight text-sidebar-foreground">
              Berry Admin
            </p>
            <p className="truncate text-xs text-sidebar-muted">Libare Digital</p>
          </div>
        ) : null}
        {mobileOpen ? (
          <Button
            variant="icon"
            size="icon"
            className="ml-auto shrink-0 border-white/10 bg-white/5 text-sidebar-foreground hover:bg-white/10 lg:hidden"
            onClick={closeMobileSidebar}
            aria-label="Fechar menu lateral"
          >
            <X size={16} />
          </Button>
        ) : null}
        <Button
          variant="icon"
          size="icon"
          className={cn(
            "hidden shrink-0 border-white/10 bg-white/5 text-sidebar-foreground hover:bg-white/10 lg:inline-flex",
            !showExpandedSidebar && "mt-1"
          )}
          onClick={toggleSidebarCollapsed}
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <SidebarSearch value={searchQuery} onChange={setSearchQuery} collapsed={!showExpandedSidebar} />

      <nav
        className="mt-3 flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin"
        aria-label="Navegacao principal"
      >
        {groups.length === 0 ? (
          <p className="px-3 py-2 text-sm text-sidebar-muted">Nenhum item encontrado.</p>
        ) : (
          groups.map((group, index) => (
            <div key={group.id} className={cn(index > 0 && "berry-sidebar-group")}>
              <SidebarNavGroup
                group={group}
                collapsed={!showExpandedSidebar}
                expanded={expandedGroups[group.id] ?? group.defaultExpanded ?? true}
                onToggle={() => toggleGroupExpanded(group.id)}
                getBadge={getBadge}
                onNavigate={onNavigate}
              />
            </div>
          ))
        )}
      </nav>

      <SidebarFooter collapsed={!showExpandedSidebar} />
    </aside>
  );
}
