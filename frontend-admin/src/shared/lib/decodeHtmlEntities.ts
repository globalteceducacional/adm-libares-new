/** Decodifica entidades HTML legadas do banco (ex.: Jo&atilde;o -> João). */
export function decodeHtmlEntities(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  if (!value.includes("&")) {
    return value;
  }
  if (typeof document === "undefined") {
    return value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&atilde;/g, "ã")
      .replace(/&Atilde;/g, "Ã")
      .replace(/&aacute;/g, "á")
      .replace(/&Aacute;/g, "Á")
      .replace(/&eacute;/g, "é")
      .replace(/&Eacute;/g, "É")
      .replace(/&iacute;/g, "í")
      .replace(/&Iacute;/g, "Í")
      .replace(/&oacute;/g, "ó")
      .replace(/&Oacute;/g, "Ó")
      .replace(/&uacute;/g, "ú")
      .replace(/&Uacute;/g, "Ú")
      .replace(/&ccedil;/g, "ç")
      .replace(/&Ccedil;/g, "Ç")
      .replace(/&agrave;/g, "à")
      .replace(/&ocirc;/g, "ô")
      .replace(/&ecirc;/g, "ê");
  }
  const doc = new DOMParser().parseFromString(value, "text/html");
  return doc.documentElement.textContent ?? value;
}
