import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

type PermissionGateProps = {
  permission?: string;
  anyOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({ permission, anyOf, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = useAuth();

  const allowed = permission
    ? hasPermission(permission)
    : anyOf?.length
      ? hasAnyPermission(anyOf)
      : true;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
