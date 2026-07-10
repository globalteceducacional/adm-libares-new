import type { ReactNode } from "react";

/** Agrupa botoes de acao da tabela em linha horizontal. */
export function TableRowActions({ children }: { children: ReactNode }) {
  return <div className="table-row-actions">{children}</div>;
}
