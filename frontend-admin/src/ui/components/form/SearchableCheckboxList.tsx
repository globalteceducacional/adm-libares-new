import { useMemo, useState } from "react";
import { SearchInput } from "../../../shared/ui";

export type SearchableCheckboxItem<TId extends string | number = number> = {
  id: TId;
  label: string;
  /** Texto extra usado na busca e exibido abaixo do label. */
  description?: string;
};

type SearchableCheckboxListProps<TId extends string | number = number> = {
  items: SearchableCheckboxItem<TId>[];
  selectedIds: readonly TId[];
  onToggle: (id: TId) => void;
  searchPlaceholder?: string;
  tall?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  emptySearchMessage?: string;
  /** Id do input para acessibilidade (aria-controls / htmlFor). */
  searchId?: string;
  /** Marca o grupo de opcoes como invalido para leitores de tela. */
  invalid?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Lista vertical de checkboxes com campo de busca.
 * Itens selecionados ficam no topo; a busca filtra por label e description.
 */
export function SearchableCheckboxList<TId extends string | number = number>({
  items,
  selectedIds,
  onToggle,
  searchPlaceholder = "Buscar...",
  tall = false,
  disabled = false,
  emptyMessage = "Nenhuma opcao disponivel.",
  emptySearchMessage = "Nenhum resultado para a busca.",
  searchId,
  invalid = false,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy
}: SearchableCheckboxListProps<TId>) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const normalizedQuery = normalize(query);

  const visibleItems = useMemo(() => {
    const filtered = normalizedQuery
      ? items.filter((item) => {
          const haystack = normalize(`${item.label} ${item.description ?? ""}`);
          return haystack.includes(normalizedQuery);
        })
      : items;

    return [...filtered].sort((a, b) => {
      const aSelected = selectedSet.has(a.id) ? 0 : 1;
      const bSelected = selectedSet.has(b.id) ? 0 : 1;
      if (aSelected !== bSelected) {
        return aSelected - bSelected;
      }
      return a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" });
    });
  }, [items, normalizedQuery, selectedSet]);

  if (items.length === 0) {
    return <small className="warning-text">{emptyMessage}</small>;
  }

  const listClassName = tall
    ? "acervo-checkbox-grid acervo-checkbox-grid--tall"
    : "acervo-checkbox-grid";

  return (
    <div className="searchable-checkbox-list">
      <SearchInput
        id={searchId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        disabled={disabled}
        aria-label={searchPlaceholder}
        autoComplete="off"
      />
      {visibleItems.length === 0 ? (
        <small className="form-hint searchable-checkbox-list__empty">{emptySearchMessage}</small>
      ) : (
        <div
          className={listClassName}
          role="group"
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
        >
          {visibleItems.map((item) => {
            const checked = selectedSet.has(item.id);
            return (
              <label key={String(item.id)} className="acervo-checkbox-item">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                  disabled={disabled}
                />
                <span>
                  <span className={checked ? "font-medium" : undefined}>{item.label}</span>
                  {item.description ? (
                    <span className="block text-xs text-muted">{item.description}</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      )}
      {selectedIds.length > 0 || normalizedQuery ? (
        <small className="form-hint">
          {selectedIds.length} selecionado(s)
          {normalizedQuery ? ` · ${visibleItems.length} na busca` : ""}
        </small>
      ) : null}
    </div>
  );
}
