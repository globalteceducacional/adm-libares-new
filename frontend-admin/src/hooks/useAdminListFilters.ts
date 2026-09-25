import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminStatusFilter } from "../types/adminList";

const SEARCH_DEBOUNCE_MS = 300;

/** Valor "todos" do filtro de acervo (ausente na URL). */
export const ACERVO_FILTER_ALL = "all";
/** Valor especial "sem acervo" (usado na lista de usuarios). */
export const ACERVO_FILTER_NONE = "none";

function parseStatus(params: URLSearchParams): AdminStatusFilter {
  const raw = params.get("status");
  return raw === "1" || raw === "0" ? raw : "all";
}

/** Aceita um id numerico (e "none" quando permitido); qualquer outro valor vira "all". */
function parseAcervo(params: URLSearchParams, allowNone: boolean): string {
  const raw = params.get("acervoId");
  if (!raw) {
    return ACERVO_FILTER_ALL;
  }
  if (raw === ACERVO_FILTER_NONE) {
    return allowNone ? raw : ACERVO_FILTER_ALL;
  }
  return /^\d+$/.test(raw) ? raw : ACERVO_FILTER_ALL;
}

/**
 * Mantém busca (`q`), status (`status`) e acervo (`acervoId`) alinhados à query string.
 * O input de busca atualiza o estado local na hora; a URL (`q`) só após debounce,
 * para evitar churn a cada tecla. Status e acervo continuam síncronos.
 * Preserva outros parâmetros ao atualizar (ex.: período no dashboard).
 */
export function useAdminListFilters(options?: {
  syncStatus?: boolean;
  syncAcervo?: boolean;
  /** Permite o valor especial "none" (sem acervo) no filtro de acervo. */
  acervoAllowNone?: boolean;
}) {
  const syncStatus = options?.syncStatus !== false;
  const syncAcervo = options?.syncAcervo === true;
  const acervoAllowNone = options?.acervoAllowNone === true;
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearchState] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusState] = useState<AdminStatusFilter>(() =>
    syncStatus ? parseStatus(searchParams) : "all"
  );
  const [acervoFilter, setAcervoState] = useState<string>(() =>
    syncAcervo ? parseAcervo(searchParams, acervoAllowNone) : ACERVO_FILTER_ALL
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
    if (syncAcervo) {
      setAcervoState(parseAcervo(searchParams, acervoAllowNone));
    }
  }, [searchParams, syncStatus, syncAcervo, acervoAllowNone]);

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

  const setAcervoFilter = useCallback(
    (value: string) => {
      if (!syncAcervo) {
        return;
      }
      setAcervoState(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === ACERVO_FILTER_ALL) {
            next.delete("acervoId");
          } else {
            next.set("acervoId", value);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, syncAcervo]
  );

  return { search, setSearch, statusFilter, setStatusFilter, acervoFilter, setAcervoFilter };
}
