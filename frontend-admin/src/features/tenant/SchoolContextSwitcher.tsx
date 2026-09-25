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
        label: canPickAllSchools ? "Todos os contratos" : "Selecione o contrato"
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
        "flex max-w-[min(100%,220px)] items-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-1 text-xs sm:max-w-none sm:gap-2 sm:px-3 sm:py-1.5",
        allowedSchools.length === 0 && "opacity-70"
      )}
    >
      <Building2 size={14} className="shrink-0 text-muted" aria-hidden />
      <span className="hidden whitespace-nowrap text-muted xs:inline sm:inline">Contrato</span>
      <div className="min-w-0 flex-1 sm:min-w-[180px] sm:max-w-[240px]">
        <SearchableSelect
          options={schoolOptions}
          value={schoolContextId != null ? String(schoolContextId) : ""}
          onChange={handleChange}
          placeholder={canPickAllSchools ? "Todos os contratos" : "Selecione o contrato"}
          searchPlaceholder="Buscar contrato..."
          emptyMessage="Nenhum contrato disponivel."
          disabled={allowedSchools.length === 0}
          compact
          className="border-0 bg-transparent px-1 shadow-none focus:ring-0"
        />
      </div>
    </div>
  );
}
