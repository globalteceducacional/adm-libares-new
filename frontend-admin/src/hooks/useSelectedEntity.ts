import { useEffect, useState } from "react";

type WithId = { id: number };

/**
 * Mantem a entidade selecionada sincronizada com a lista (ex.: detail modal).
 * Se o item sumir da lista (delete/filtro), limpa a selecao.
 */
export function useSelectedEntity<T extends WithId>(items: readonly T[]) {
  const [selected, setSelected] = useState<T | null>(null);

  useEffect(() => {
    setSelected((current) => {
      if (!current) {
        return null;
      }
      return items.find((item) => item.id === current.id) ?? null;
    });
  }, [items]);

  return [selected, setSelected] as const;
}
