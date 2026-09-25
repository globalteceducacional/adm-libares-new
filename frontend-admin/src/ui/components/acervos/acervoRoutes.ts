export type AcervoHubTab = "livros" | "leitores";

export const ACERVO_HUB_DEFAULT_TAB: AcervoHubTab = "livros";

/** Rota do hub do acervo; `tab` opcional abre direto na aba. */
export function acervoHubPath(acervoId: number, tab?: AcervoHubTab): string {
  const base = `/acervos/${acervoId}`;
  return tab && tab !== ACERVO_HUB_DEFAULT_TAB ? `${base}?tab=${tab}` : base;
}

export function parseAcervoHubTab(raw: string | null): AcervoHubTab {
  return raw === "leitores" ? "leitores" : ACERVO_HUB_DEFAULT_TAB;
}

/** Converte o parametro de rota em id valido (inteiro positivo) ou null. */
export function parseAcervoIdParam(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) {
    return null;
  }
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
