import { lazy, Suspense, type ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./features/auth/AuthContext";
import { PermissionRoute } from "./features/auth/PermissionRoute";
import { findNavPermissionForPath } from "./features/layout/config/navigation";
import { isAuthenticated } from "./lib/auth";
import { AppLayout } from "./features/layout/AppLayout";

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
const AuditPage = lazy(() =>
  import("./ui/pages/AuditPage").then((module) => ({ default: module.AuditPage }))
);
const SchoolsPage = lazy(() =>
  import("./ui/pages/SchoolsPage").then((module) => ({ default: module.SchoolsPage }))
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/livros" element={<GuardedPage path="/livros" element={<BooksPage />} />} />
          <Route path="/autores" element={<GuardedPage path="/autores" element={<AuthorsPage />} />} />
          <Route path="/categorias" element={<GuardedPage path="/categorias" element={<CategoriesPage />} />} />
          <Route path="/secoes" element={<GuardedPage path="/secoes" element={<HomeSectionsPage />} />} />
          <Route path="/acervos" element={<GuardedPage path="/acervos" element={<AcervosPage />} />} />
          <Route path="/sites" element={<GuardedPage path="/sites" element={<SitesPage />} />} />
          <Route
            path="/sites/autores"
            element={<GuardedPage path="/sites/autores" element={<SiteAuthorsPage />} />}
          />
          <Route
            path="/sites/categorias"
            element={<GuardedPage path="/sites/categorias" element={<SiteCategoriesPage />} />}
          />
          <Route
            path="/sites/secoes"
            element={<GuardedPage path="/sites/secoes" element={<SiteSectionsPage />} />}
          />
          <Route
            path="/sites/comentarios"
            element={<GuardedPage path="/sites/comentarios" element={<SiteCommentsPage />} />}
          />
          <Route path="/usuarios" element={<GuardedPage path="/usuarios" element={<UsersPage />} />} />
          <Route path="/comentarios" element={<CommentsPage />} />
          <Route path="/escolas" element={<GuardedPage path="/escolas" element={<SchoolsPage />} />} />
          <Route path="/perfis" element={<GuardedPage path="/perfis" element={<RolesPage />} />} />
          <Route path="/auditoria" element={<AuditPage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}
