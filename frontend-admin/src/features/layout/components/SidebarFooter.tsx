import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/ui";
import { cn } from "../../../shared/lib/cn";
import { useAuth } from "../../auth/AuthContext";
import { useThemeStore } from "../../../stores/themeStore";

type SidebarFooterProps = {
  collapsed: boolean;
};

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const displayName = user?.name || user?.username || "Administrador";
  const subtitle = user?.isSuperAdmin
    ? "Super Admin"
    : user?.schoolName
      ? user.schoolName
      : "Admin da escola";

  return (
    <div className={cn("mt-auto space-y-3 border-t border-sidebar-border pt-4", collapsed && "space-y-2")}>
      {!collapsed ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
          <p className="truncate text-xs text-sidebar-muted">{subtitle}</p>
        </div>
      ) : null}

      <div className={cn("flex gap-2", collapsed ? "flex-col items-center" : "flex-row")}>
        <Button
          variant="icon"
          size="icon"
          className="border-white/10 bg-white/5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          onClick={toggleTheme}
          aria-label="Alternar tema claro/escuro"
          title="Alternar tema"
        >
          {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button
          variant={collapsed ? "icon" : "secondary"}
          size={collapsed ? "icon" : "sm"}
          className={cn(
            !collapsed && "flex-1 border-white/10 bg-white/5 text-sidebar-foreground hover:bg-white/10",
            collapsed && "border-white/10 bg-white/5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          )}
          onClick={handleLogout}
          aria-label="Sair do painel"
          title="Sair"
        >
          <LogOut size={16} />
          {!collapsed ? "Sair" : null}
        </Button>
      </div>
    </div>
  );
}
