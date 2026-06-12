import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminStatusFilter } from "../types/adminList";

function parseStatus(params: URLSearchParams): AdminStatusFilter {
  const raw = params.get("status");
  return raw === "1" || raw === "0" ? raw : "all";
}

/**
 * Mantém busca (`q`) e, opcionalmente, status (`status`) alinhados à query string.
 * Preserva outros parâmetros ao atualizar (ex.: período no dashboard não é tocado aqui).
 */
export function useAdminListFilters(options?: { syncStatus?: boolean }) {
  const syncStatus = options?.syncStatus !== false;
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearchState] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusState] = useState<AdminStatusFilter>(() =>
    syncStatus ? parseStatus(searchParams) : "all"
  );

  useEffect(() => {
    setSearchState(searchParams.get("q") ?? "");
    if (syncStatus) {
      setStatusState(parseStatus(searchParams));
    }
  }, [searchParams, syncStatus]);

  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value.trim()) {
            next.set("q", value);
          } else {
            next.delete("q");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setStatusFilter = useCallback(
    (value: AdminStatusFilter) => {
      if (!syncStatus) {
        return;
      }
      setStatusState(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === "all") {
            next.delete("status");
          } else {
            next.set("status", value);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, syncStatus]
  );

  return { search, setSearch, statusFilter, setStatusFilter };
}
