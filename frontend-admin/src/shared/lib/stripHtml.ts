import { decodeHtmlEntities } from "./decodeHtmlEntities";

/** Remove tags HTML legadas e normaliza espacos para exibicao em texto. */
export function stripHtml(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const decoded = decodeHtmlEntities(value);
  if (typeof document === "undefined") {
    return decoded.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(decoded, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
