import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, SearchInput } from "../../../shared/ui";
import { clearToken } from "../../../lib/auth";
import { useThemeStore } from "../../../stores/themeStore";
import { useLayoutStore } from "../../../stores/layoutStore";
import { Breadcrumbs, type BreadcrumbItem } from "../../../shared/ui/PageHeader";

type TopbarProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
};

export function Topbar({ title, breadcrumbs }: TopbarProps) {
  const navigate = useNavigate();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const setMobileSidebarOpen = useLayoutStore((s) => s.setMobileSidebarOpen);

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="icon"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </Button>
          <div className="min-w-0">
            <Breadcrumbs items={breadcrumbs} className="mb-1 hidden sm:flex" />
            <h1 className="truncate text-lg font-bold text-foreground md:text-xl">{title}</h1>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <SearchInput
            className="w-full min-w-[220px] sm:w-[280px]"
            placeholder="Buscar no painel..."
            aria-label="Buscar no painel"
          />
          <Button variant="icon" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
