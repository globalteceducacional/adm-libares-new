import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  clearToken,
  getSchoolContextId,
  getToken,
  saveSchoolContextId
} from "../../lib/auth";
import { fetchAuthMe } from "../../services/authMeService";
import type { AuthMeResponse, AuthSchoolOption } from "../../types/auth";

type AuthContextValue = {
  user: AuthMeResponse | null;
  loading: boolean;
  permissions: Set<string>;
  isSuperAdmin: boolean;
  schoolContextId: number | null;
  allowedSchools: AuthSchoolOption[];
  requiresSchoolContext: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  setSchoolContextId: (schoolId: number | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toPermissionSet(permissions: string[] | undefined): Set<string> {
  return new Set(permissions ?? []);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolContextId, setSchoolContextIdState] = useState<number | null>(() => getSchoolContextId());

  const permissions = useMemo(() => toPermissionSet(user?.permissions), [user?.permissions]);
  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const allowedSchools = user?.allowedSchools ?? [];
  const requiresSchoolContext = user?.requiresSchoolContext ?? false;

  const hasPermission = useCallback(
    (permission: string) => isSuperAdmin || permissions.has(permission),
    [isSuperAdmin, permissions]
  );

  const hasAnyPermission = useCallback(
    (codes: string[]) => isSuperAdmin || codes.some((code) => permissions.has(code)),
    [isSuperAdmin, permissions]
  );

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const me = await fetchAuthMe();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
      setSchoolContextIdState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setSchoolContextIdState(null);
  }, []);

  const setSchoolContextId = useCallback((schoolId: number | null) => {
    saveSchoolContextId(schoolId);
    setSchoolContextIdState(schoolId);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      permissions,
      isSuperAdmin,
      schoolContextId,
      allowedSchools,
      requiresSchoolContext,
      hasPermission,
      hasAnyPermission,
      refresh,
      logout,
      setSchoolContextId
    }),
    [
      user,
      loading,
      permissions,
      isSuperAdmin,
      schoolContextId,
      allowedSchools,
      requiresSchoolContext,
      hasPermission,
      hasAnyPermission,
      refresh,
      logout,
      setSchoolContextId
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
