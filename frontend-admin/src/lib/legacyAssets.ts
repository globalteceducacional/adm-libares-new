// Por defeito usa o mesmo host da API + /legacy/assets (Spring serve ../adm-libares quando existir).
const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

/**
 * Base HTTP onde o Spring expõe ficheiros estáticos com `permitAll` em `/legacy/assets/**`.
 * Se `VITE_LEGACY_ASSETS_BASE_URL` apontar só para o host da API (ex.: http://localhost:8080),
 * anexamos `/legacy/assets` — caso contrário os `<img>` batem em rotas protegidas e recebem 403.
 */
function resolveLegacyAssetsBaseUrl(): string {
  const raw = (import.meta.env.VITE_LEGACY_ASSETS_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    return `${apiBase}/legacy/assets`;
  }
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (withoutTrailingSlash.includes("/legacy/assets")) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/legacy/assets`;
}

const LEGACY_ASSETS_BASE_URL = resolveLegacyAssetsBaseUrl();

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

/** Codifica cada segmento do caminho (evita `&` em nomes de ficheiro ser lido como query string). */
function encodePathSegments(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}

export function resolveLegacyAssetUrl(
  legacyPath: string | null | undefined,
  folder = "images"
): string | null {
  if (!legacyPath) {
    return null;
  }

  const trimmed = legacyPath.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const relative = parsed.pathname.replace(/^\/+/, "");
      const encodedPath = relative.length > 0 ? `/${encodePathSegments(relative)}` : "/";
      return `${parsed.origin}${encodedPath}${parsed.search}${parsed.hash}`;
    } catch {
      return trimmed;
    }
  }

  const baseUrl = normalizeBaseUrl(LEGACY_ASSETS_BASE_URL);

  if (trimmed.startsWith("/")) {
    const relative = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    return `${baseUrl}/${encodePathSegments(relative)}`;
  }

  return `${baseUrl}/${encodePathSegments(`${folder}/${trimmed}`)}`;
}
