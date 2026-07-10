const TOKEN_KEY = "adm_libare_access_token";
const SCHOOL_CONTEXT_KEY = "adm_libare_school_context";

/** Formato JWT compacto (3 segmentos). Evita tratar "undefined" ou lixo no localStorage como sessao valida. */
function looksLikeJwt(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

export function saveToken(token: string) {
  const trimmed = token?.trim() ?? "";
  if (!trimmed || trimmed === "undefined" || trimmed === "null" || !looksLikeJwt(trimmed)) {
    return;
  }
  localStorage.setItem(TOKEN_KEY, trimmed);
}

export function getToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null" || !looksLikeJwt(trimmed)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return trimmed;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  clearSchoolContextId();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function saveSchoolContextId(schoolId: number | null) {
  if (schoolId == null || schoolId <= 0) {
    localStorage.removeItem(SCHOOL_CONTEXT_KEY);
    return;
  }
  localStorage.setItem(SCHOOL_CONTEXT_KEY, String(schoolId));
}

export function getSchoolContextId(): number | null {
  const raw = localStorage.getItem(SCHOOL_CONTEXT_KEY);
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    localStorage.removeItem(SCHOOL_CONTEXT_KEY);
    return null;
  }
  return parsed;
}

export function clearSchoolContextId() {
  localStorage.removeItem(SCHOOL_CONTEXT_KEY);
}
