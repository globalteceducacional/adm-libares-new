import { Building2 } from "lucide-react";
import { useEffect } from "react";
import { useInvalidateAdminQueries } from "../shared/api/queries";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../../shared/lib/cn";

export function SchoolContextSwitcher() {
  const {
    isSuperAdmin,
    schoolContextId,
    setSchoolContextId,
    hasPermission,
    requiresSchoolContext,
    allowedSchools
  } = useAuth();
  const invalidate = useInvalidateAdminQueries();

  const canPickAllSchools = isSuperAdmin && hasPermission("platform.impersonate");
  const showSwitcher = canPickAllSchools || (requiresSchoolContext && allowedSchools.length > 1);

  useEffect(() => {
    if (!showSwitcher || !schoolContextId) {
      return;
    }
    const exists = allowedSchools.some((school) => school.id === schoolContextId);
    if (!exists) {
      setSchoolContextId(null);
    }
  }, [showSwitcher, schoolContextId, allowedSchools, setSchoolContextId]);

  useEffect(() => {
    if (!requiresSchoolContext || allowedSchools.length !== 1 || schoolContextId != null) {
      return;
    }
    setSchoolContextId(allowedSchools[0].id);
  }, [requiresSchoolContext, allowedSchools, schoolContextId, setSchoolContextId]);

  if (!showSwitcher) {
    return null;
  }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const nextId = value === "" ? null : Number(value);
    setSchoolContextId(Number.isFinite(nextId) && nextId! > 0 ? nextId : null);
    void invalidate.acervos();
    void invalidate.acervoOptions();
    void invalidate.books();
    void invalidate.users();
    void invalidate.roles();
  }

  return (
    <label
      className={cn(
        "hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs sm:flex",
        allowedSchools.length === 0 && "opacity-70"
      )}
    >
      <Building2 size={14} className="shrink-0 text-muted" aria-hidden />
      <span className="whitespace-nowrap text-muted">Escola</span>
      <select
        className="max-w-[180px] truncate bg-transparent text-sm font-medium text-foreground focus:outline-none"
        value={schoolContextId ?? ""}
        onChange={handleChange}
        disabled={allowedSchools.length === 0}
        aria-label="Contexto de escola ativo"
      >
        {canPickAllSchools ? <option value="">Todas as escolas</option> : <option value="">Selecione a escola</option>}
        {allowedSchools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>
    </label>
  );
}
