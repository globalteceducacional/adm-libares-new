/** Paleta inspirada no Berry (Material) para graficos Recharts. */
export const CHART_COLORS = [
  "#673ab7",
  "#2196f3",
  "#00bcd4",
  "#4caf50",
  "#ff9800",
  "#e91e63",
  "#9c27b0",
  "#3f51b5"
] as const;

export const CHART_PRIMARY = "#673ab7";
export const CHART_SECONDARY = "#2196f3";
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
