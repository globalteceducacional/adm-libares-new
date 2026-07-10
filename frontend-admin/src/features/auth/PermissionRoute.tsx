import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type PermissionRouteProps = {
  permission?: string;
  anyOf?: string[];
  children: React.ReactElement;
  redirectTo?: string;
};

export function PermissionRoute({
  permission,
  anyOf,
  children,
  redirectTo = "/dashboard"
}: PermissionRouteProps) {
  const { loading, hasPermission, hasAnyPermission } = useAuth();

  if (loading) {
    return <div className="page-loader">Carregando permissoes...</div>;
  }

  const allowed = permission
    ? hasPermission(permission)
    : anyOf?.length
      ? hasAnyPermission(anyOf)
      : true;

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
