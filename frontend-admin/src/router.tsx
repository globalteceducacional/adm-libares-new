import { lazy, Suspense, type ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./features/auth/AuthContext";
import { PermissionRoute } from "./features/auth/PermissionRoute";
import { findNavPermissionForPath } from "./features/layout/config/navigation";
import { isAuthenticated } from "./lib/auth";
import { AppLayout } from "./features/layout/AppLayout";
import { ErrorBoundary } from "./shared/ui";

const NotFoundPage = lazy(() =>
  import("./ui/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);
const ForbiddenPage = lazy(() =>
  import("./ui/pages/ForbiddenPage").then((m) => ({ default: m.ForbiddenPage }))
);

const DashboardPage = lazy(() =>
  import("./ui/pages/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const BooksPage = lazy(() =>
  import("./ui/pages/BooksPage").then((module) => ({ default: module.BooksPage }))
);
const UsersPage = lazy(() =>
  import("./ui/pages/UsersPage").then((module) => ({ default: module.UsersPage }))
);
const CommentsPage = lazy(() =>
  import("./ui/pages/CommentsPage").then((module) => ({ default: module.CommentsPage }))
);
const AuthorsPage = lazy(() =>
  import("./ui/pages/AuthorsPage").then((module) => ({ default: module.AuthorsPage }))
);
const CategoriesPage = lazy(() =>
  import("./ui/pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage }))
);
const HomeSectionsPage = lazy(() =>
  import("./ui/pages/HomeSectionsPage").then((module) => ({ default: module.HomeSectionsPage }))
);
const AcervosPage = lazy(() =>
  import("./ui/pages/AcervosPage").then((module) => ({ default: module.AcervosPage }))
);
const AcervoHubPage = lazy(() =>
  import("./ui/pages/AcervoHubPage").then((module) => ({ default: module.AcervoHubPage }))
);
const AuditPage = lazy(() =>
  import("./ui/pages/AuditPage").then((module) => ({ default: module.AuditPage }))
);
const SchoolsPage = lazy(() =>
  import("./ui/pages/SchoolsPage").then((module) => ({ default: module.SchoolsPage }))
);
const TeamPage = lazy(() =>
  import("./ui/pages/TeamPage").then((module) => ({ default: module.TeamPage }))
);
const RolesPage = lazy(() =>
  import("./ui/pages/RolesPage").then((module) => ({ default: module.RolesPage }))
);
const SitesPage = lazy(() =>
  import("./ui/pages/SitesPage").then((module) => ({ default: module.SitesPage }))
);
const SiteAuthorsPage = lazy(() =>
  import("./ui/pages/SiteAuthorsPage").then((module) => ({ default: module.SiteAuthorsPage }))
);
const SiteCategoriesPage = lazy(() =>
  import("./ui/pages/SiteCategoriesPage").then((module) => ({ default: module.SiteCategoriesPage }))
);
const SiteSectionsPage = lazy(() =>
  import("./ui/pages/SiteSectionsPage").then((module) => ({ default: module.SiteSectionsPage }))
);
const SiteCommentsPage = lazy(() =>
  import("./ui/pages/SiteCommentsPage").then((module) => ({ default: module.SiteCommentsPage }))
);
const NotificationsPage = lazy(() =>
  import("./ui/pages/NotificationsPage").then((module) => ({ default: module.NotificationsPage }))
);
const SettingsPage = lazy(() =>
  import("./ui/pages/SettingsPage").then((module) => ({ default: module.SettingsPage }))
);
const GamesPage = lazy(() =>
  import("./ui/pages/GamesPage").then((module) => ({ default: module.GamesPage }))
);
const LoginPage = lazy(() =>
  import("./ui/pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { loading, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="page-loader">Carregando sessao...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuardedPage({ path, element }: { path: string; element: ReactElement }) {
  const permission = findNavPermissionForPath(path);
  if (!permission) {
    return element;
  }
  return <PermissionRoute permission={permission}>{element}</PermissionRoute>;
}

export function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="page-loader">Carregando painel...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<ErrorBoundary><GuardedPage path="/dashboard" element={<DashboardPage />} /></ErrorBoundary>} />
            <Route path="/livros" element={<ErrorBoundary><GuardedPage path="/livros" element={<BooksPage />} /></ErrorBoundary>} />
            <Route path="/autores" element={<ErrorBoundary><GuardedPage path="/autores" element={<AuthorsPage />} /></ErrorBoundary>} />
            <Route path="/categorias" element={<ErrorBoundary><GuardedPage path="/categorias" element={<CategoriesPage />} /></ErrorBoundary>} />
            <Route path="/secoes" element={<ErrorBoundary><GuardedPage path="/secoes" element={<HomeSectionsPage />} /></ErrorBoundary>} />
            <Route path="/acervos" element={<ErrorBoundary><GuardedPage path="/acervos" element={<AcervosPage />} /></ErrorBoundary>} />
            {/* Hub do acervo reaproveita a permissao de /acervos (acervos.view). */}
            <Route
              path="/acervos/:acervoId"
              element={<ErrorBoundary><GuardedPage path="/acervos" element={<AcervoHubPage />} /></ErrorBoundary>}
            />
            <Route path="/sites" element={<ErrorBoundary><GuardedPage path="/sites" element={<SitesPage />} /></ErrorBoundary>} />
            <Route
              path="/sites/autores"
              element={<ErrorBoundary><GuardedPage path="/sites/autores" element={<SiteAuthorsPage />} /></ErrorBoundary>}
            />
            <Route
              path="/sites/categorias"
              element={<ErrorBoundary><GuardedPage path="/sites/categorias" element={<SiteCategoriesPage />} /></ErrorBoundary>}
            />
            <Route
              path="/sites/secoes"
              element={<ErrorBoundary><GuardedPage path="/sites/secoes" element={<SiteSectionsPage />} /></ErrorBoundary>}
            />
            <Route
              path="/sites/comentarios"
              element={<ErrorBoundary><GuardedPage path="/sites/comentarios" element={<SiteCommentsPage />} /></ErrorBoundary>}
            />
            <Route path="/usuarios" element={<ErrorBoundary><GuardedPage path="/usuarios" element={<UsersPage />} /></ErrorBoundary>} />
            <Route path="/comentarios" element={<ErrorBoundary><GuardedPage path="/comentarios" element={<CommentsPage />} /></ErrorBoundary>} />
            <Route path="/contratos" element={<ErrorBoundary><GuardedPage path="/contratos" element={<SchoolsPage />} /></ErrorBoundary>} />
            <Route path="/equipe" element={<ErrorBoundary><GuardedPage path="/equipe" element={<TeamPage />} /></ErrorBoundary>} />
            <Route path="/perfis" element={<ErrorBoundary><GuardedPage path="/perfis" element={<RolesPage />} /></ErrorBoundary>} />
            <Route path="/auditoria" element={<ErrorBoundary><GuardedPage path="/auditoria" element={<AuditPage />} /></ErrorBoundary>} />
            <Route path="/jogos" element={<ErrorBoundary><GuardedPage path="/jogos" element={<GamesPage />} /></ErrorBoundary>} />
            <Route path="/definicoes" element={<ErrorBoundary><GuardedPage path="/definicoes" element={<SettingsPage />} /></ErrorBoundary>} />
            <Route path="/notificacoes" element={<ErrorBoundary><GuardedPage path="/notificacoes" element={<NotificationsPage />} /></ErrorBoundary>} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated() ? "/livros" : "/login"} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
