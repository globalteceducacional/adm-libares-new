import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import type { NavGroupConfig } from "../config/navigation";
import { SidebarNavItem } from "./SidebarNavItem";

type SidebarNavGroupProps = {
  group: NavGroupConfig;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  getBadge: (key?: NavGroupConfig["items"][number]["badgeKey"]) => number | undefined;
  onNavigate?: () => void;
};

export function SidebarNavGroup({
  group,
  collapsed,
  expanded,
  onToggle,
  getBadge,
  onNavigate
}: SidebarNavGroupProps) {
  const isSingleOverview = group.id === "overview";
  const showHeader = !collapsed && !isSingleOverview && group.label;

  return (
    <div className="space-y-1">
      {showHeader ? (
        group.collapsible ? (
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sidebar-muted transition-colors hover:text-sidebar-foreground"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            <span>{group.label}</span>
            <ChevronDown
              size={14}
              className={cn("opacity-70 transition-transform duration-200", expanded ? "rotate-0" : "-rotate-90")}
            />
          </button>
        ) : (
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sidebar-muted">
            {group.label}
          </p>
        )
      ) : null}

      <AnimatePresence initial={false}>
        {(collapsed || expanded || isSingleOverview || !group.collapsible) && (
          <motion.div
            initial={group.collapsible && !collapsed ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-0.5 overflow-hidden"
          >
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                badge={getBadge(item.badgeKey)}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
