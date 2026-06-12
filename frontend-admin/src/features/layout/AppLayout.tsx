import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "../../shared/lib/cn";
import { useLayoutStore } from "../../stores/layoutStore";
import { useThemeStore } from "../../stores/themeStore";
import { buildBreadcrumbs, findNavItem } from "./config/navigation";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

export function AppLayout() {
  const location = useLocation();
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useLayoutStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useLayoutStore((s) => s.closeMobileSidebar);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  const navItem = findNavItem(location.pathname);
  const title = navItem?.label ?? "Painel Administrativo";
  const breadcrumbs = buildBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            aria-label="Fechar menu"
          />
        ) : null}
      </AnimatePresence>

      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} onNavigate={closeMobileSidebar} />

      <div className={cn("flex min-w-0 flex-1 flex-col", sidebarCollapsed ? "lg:pl-0" : "")}>
        <Topbar title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
