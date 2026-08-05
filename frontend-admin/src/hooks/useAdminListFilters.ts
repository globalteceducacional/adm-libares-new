import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminStatusFilter } from "../types/adminList";

const SEARCH_DEBOUNCE_MS = 300;

function parseStatus(params: URLSearchParams): AdminStatusFilter {
  const raw = params.get("status");
  return raw === "1" || raw === "0" ? raw : "all";
}

/**
 * Mantém busca (`q`) e, opcionalmente, status (`status`) alinhados à query string.
 * O input de busca atualiza o estado local na hora; a URL (`q`) só após debounce,
 * para evitar churn a cada tecla. Status continua síncrono.
 * Preserva outros parâmetros ao atualizar (ex.: período no dashboard).
 */
export function useAdminListFilters(options?: { syncStatus?: boolean }) {
  const syncStatus = options?.syncStatus !== false;
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearchState] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusState] = useState<AdminStatusFilter>(() =>
    syncStatus ? parseStatus(searchParams) : "all"
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef(search);
  searchRef.current = search;

  // Sincroniza estado local quando a URL muda por navegação externa (voltar/avançar).
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (urlQ !== searchRef.current) {
      setSearchState(urlQ);
    }
    if (syncStatus) {
      setStatusState(parseStatus(searchParams));
    }
  }, [searchParams, syncStatus]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            const trimmed = value.trim();
            const currentQ = prev.get("q") ?? "";
            if (trimmed === currentQ) {
              return prev;
            }
            if (trimmed) {
              next.set("q", trimmed);
            } else {
              next.delete("q");
            }
            return next;
          },
          { replace: true }
        );
      }, SEARCH_DEBOUNCE_MS);
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
