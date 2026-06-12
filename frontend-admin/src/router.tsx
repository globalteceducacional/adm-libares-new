import { lazy, Suspense, type ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
const AuditPage = lazy(() =>
  import("./ui/pages/AuditPage").then((module) => ({ default: module.AuditPage }))
);
const LoginPage = lazy(() =>
  import("./ui/pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);

function ProtectedRoute({ children }: { children: ReactElement }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
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
          <Route path="/livros" element={<BooksPage />} />
          <Route path="/autores" element={<AuthorsPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/comentarios" element={<CommentsPage />} />
          <Route path="/auditoria" element={<AuditPage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}
