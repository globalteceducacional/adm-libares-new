import { decodeHtmlEntities } from "../shared/lib/decodeHtmlEntities";

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const DEFAULT_REMOTE_IMAGES_BASE_URL = "https://ebook.alenxandriaglobaltec.com/images";

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

function resolveRemoteImagesBaseUrl(): string {
  const raw = (import.meta.env.VITE_LEGACY_REMOTE_IMAGES_BASE_URL as string | undefined)?.trim();
  return (raw || DEFAULT_REMOTE_IMAGES_BASE_URL).replace(/\/+$/, "");
}

const LEGACY_ASSETS_BASE_URL = resolveLegacyAssetsBaseUrl();
const REMOTE_IMAGES_BASE_URL = resolveRemoteImagesBaseUrl();

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function normalizeLegacyPath(legacyPath: string): string {
  return decodeHtmlEntities(legacyPath).trim();
}

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

function buildAssetUrl(baseUrl: string, legacyPath: string, folder: string): string {
  const trimmed = normalizeLegacyPath(legacyPath);
  if (!trimmed) {
    return "";
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

  const normalizedBase = normalizeBaseUrl(baseUrl);
  if (trimmed.startsWith("/")) {
    return `${normalizedBase}/${encodePathSegments(trimmed.slice(1))}`;
  }

  const hasFolderPrefix = trimmed.startsWith(`${folder}/`) || trimmed.startsWith("images/");
  const relativePath = hasFolderPrefix ? trimmed : `${folder}/${trimmed}`;
  return `${normalizedBase}/${encodePathSegments(relativePath)}`;
}

function pushUnique(urls: string[], url: string) {
  if (url && !urls.includes(url)) {
    urls.push(url);
  }
}

export function resolveLegacyAssetUrl(
  legacyPath: string | null | undefined,
  folder = "images"
): string | null {
  const urls = resolveLegacyAssetUrls(legacyPath, folder);
  return urls[0] ?? null;
}

function buildRemoteImageUrl(legacyPath: string): string {
  const trimmed = normalizeLegacyPath(legacyPath);
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return buildAssetUrl(REMOTE_IMAGES_BASE_URL, trimmed, "images");
  }
  const fileName = trimmed.replace(/^\/+/, "").replace(/^images\//, "");
  return `${normalizeBaseUrl(REMOTE_IMAGES_BASE_URL)}/${encodePathSegments(fileName)}`;
}

export function resolveLegacyAssetUrls(
  legacyPath: string | null | undefined,
  folder = "images"
): string[] {
  if (!legacyPath) {
    return [];
  }

  const raw = legacyPath.trim();
  if (!raw) {
    return [];
  }

  const urls: string[] = [];
  // Remoto primeiro: na VPS o volume local pode estar vazio; ebook ainda serve as capas.
  pushUnique(urls, buildRemoteImageUrl(raw));
  pushUnique(urls, buildAssetUrl(LEGACY_ASSETS_BASE_URL, raw, folder));

  const decoded = normalizeLegacyPath(raw);
  if (decoded !== raw) {
    pushUnique(urls, buildRemoteImageUrl(decoded));
    pushUnique(urls, buildAssetUrl(LEGACY_ASSETS_BASE_URL, decoded, folder));
  }

  return urls;
}
