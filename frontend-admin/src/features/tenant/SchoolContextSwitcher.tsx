import { Building2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useInvalidateAdminQueries } from "../shared/api/queries";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../../shared/lib/cn";
import { SearchableSelect } from "../../ui/components/form/SearchableSelect";

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

  const schoolOptions = useMemo(
    () => [
      {
        value: "",
        label: canPickAllSchools ? "Todas as escolas" : "Selecione a escola"
      },
      ...allowedSchools.map((school) => ({
        value: String(school.id),
        label: school.name
      }))
    ],
    [allowedSchools, canPickAllSchools]
  );

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

  function handleChange(nextValue: string) {
    const nextId = nextValue === "" ? null : Number(nextValue);
    setSchoolContextId(Number.isFinite(nextId) && nextId != null && nextId > 0 ? nextId : null);
    void invalidate.acervos();
    void invalidate.acervoOptions();
    void invalidate.books();
    void invalidate.users();
    void invalidate.roles();
  }

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs sm:flex",
        allowedSchools.length === 0 && "opacity-70"
      )}
    >
      <Building2 size={14} className="shrink-0 text-muted" aria-hidden />
      <span className="whitespace-nowrap text-muted">Escola</span>
      <div className="min-w-[180px] max-w-[240px]">
        <SearchableSelect
          options={schoolOptions}
          value={schoolContextId != null ? String(schoolContextId) : ""}
          onChange={handleChange}
          placeholder={canPickAllSchools ? "Todas as escolas" : "Selecione a escola"}
          searchPlaceholder="Buscar escola..."
          emptyMessage="Nenhuma escola disponivel."
          disabled={allowedSchools.length === 0}
          compact
          className="border-0 bg-transparent px-1 shadow-none focus:ring-0"
        />
      </div>
    </div>
  );
}
