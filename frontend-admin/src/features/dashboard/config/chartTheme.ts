/**
 * Paleta dos graficos Recharts alinhada a identidade Globaltec:
 * azul royal (#0020A0) e destaque (#2F4FD0) do logo, seguidos de cores de apoio distinguiveis.
 * Recharts nao resolve CSS vars em SVG, por isso hex fixo aqui.
 */
export const CHART_COLORS = [
  "#0020a0",
  "#2f4fd0",
  "#00bcd4",
  "#4caf50",
  "#ff9800",
  "#e91e63",
  "#7986cb",
  "#9db0f2"
] as const;

export const CHART_PRIMARY = "#0020a0";
export const CHART_SECONDARY = "#2f4fd0";
export const CHART_SUCCESS = "#00bcd4";
export const CHART_WARNING = "#ff9800";

export const chartTooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 13,
  boxShadow: "var(--shadow)"
};

export const chartGridStroke = "color-mix(in oklab, var(--border) 80%, transparent)";
