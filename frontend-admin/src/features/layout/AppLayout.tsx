import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useLayoutStore } from "../../stores/layoutStore";
import { useThemeStore } from "../../stores/themeStore";
import { buildBreadcrumbs } from "./config/navigation";
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

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const breadcrumbs = buildBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <a
        href="#main-content"
        className="sr-only left-4 top-4 z-[120] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card focus:not-sr-only focus:absolute"
      >
        Pular para o conteudo
      </a>

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

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-screen">
        <Topbar breadcrumbs={breadcrumbs} />
        <main id="main-content" tabIndex={-1} className="flex-1 px-3 py-4 outline-none sm:px-5 md:px-8 md:py-6">
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
