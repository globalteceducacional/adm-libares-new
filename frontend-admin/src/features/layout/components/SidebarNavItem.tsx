import { NavLink } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import type { NavItemConfig } from "../config/navigation";

type SidebarNavItemProps = {
  item: NavItemConfig;
  collapsed: boolean;
  badge?: number;
  onNavigate?: () => void;
};

export function SidebarNavItem({ item, collapsed, badge, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard" || item.to === "/sites"}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          collapsed && "justify-center px-2 py-2.5",
          isActive
            ? "berry-nav-item-active text-white"
            : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "berry-nav-icon grid shrink-0 place-items-center transition-colors",
              collapsed ? "h-9 w-9 rounded-xl" : "h-8 w-8 rounded-lg",
              isActive
                ? collapsed
                  ? "bg-white/15 text-white"
                  : "text-white"
                : "text-sidebar-muted group-hover:bg-white/5 group-hover:text-sidebar-foreground"
            )}
          >
            <Icon size={18} />
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {badge !== undefined ? (
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-sidebar-accent/20 text-sidebar-accent"
                  )}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <span className="sr-only">{item.label}</span>
              {badge !== undefined ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-300 ring-2 ring-[#212946]" aria-hidden />
              ) : null}
            </>
          )}
        </>
      )}
    </NavLink>
  );
}
