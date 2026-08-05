import { ChevronDown, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import { cn } from "../../../shared/lib/cn";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptySearchMessage?: string;
  disabled?: boolean;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  id?: string;
  className?: string;
  /** Estilo compacto para filtros de listagem (BerrySelect). */
  compact?: boolean;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Select unico com campo de busca e lista filtravel (autocompletar).
 * Ideal para listas longas: autores, acervos, escolas.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhuma opcao disponivel.",
  emptySearchMessage = "Nenhum resultado para a busca.",
  disabled = false,
  required = false,
  allowEmpty = false,
  emptyLabel = "Nenhum",
  id,
  className,
  compact = false
}: SearchableSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const displayLabel = selectedOption
    ? selectedOption.label
    : !value && allowEmpty
      ? emptyLabel
      : value
        ? `Selecionado (#${value})`
        : placeholder;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    const base = normalizedQuery
      ? options.filter((option) => normalize(option.label).includes(normalizedQuery))
      : options;
    return base;
  }, [options, query]);

  const selectableRows = useMemo(() => {
    const rows: Array<{ value: string; label: string; isEmpty?: boolean }> = [];
    if (allowEmpty && !normalize(query)) {
      rows.push({ value: "", label: emptyLabel, isEmpty: true });
    }
    filteredOptions.forEach((option) => {
      rows.push(option);
    });
    return rows;
  }, [allowEmpty, emptyLabel, filteredOptions, query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setHighlightIndex(0);
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function selectValue(next: string) {
    onChange(next);
    close();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) =>
        selectableRows.length === 0 ? 0 : Math.min(current + 1, selectableRows.length - 1)
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const row = selectableRows[highlightIndex];
      if (row) {
        selectValue(row.value);
      }
    }
  }

  const triggerClassName = compact
    ? cn(
        "berry-select searchable-select__trigger searchable-select__trigger--compact",
        "h-10 w-full min-w-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
        "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        "sm:min-w-[160px]",
        className
      )
    : cn("searchable-select__trigger", className);

  const control = (
    <div
      ref={rootRef}
      className={cn("searchable-select", compact && "searchable-select--compact")}
      onKeyDown={open ? handleListKeyDown : undefined}
    >
      {/* Valor enviado em formularios nativos (required/validacao HTML). */}
      <input type="hidden" value={value} required={required} disabled={disabled} readOnly />
      <button
        type="button"
        id={selectId}
        className={triggerClassName}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (disabled) {
            return;
          }
          setOpen((current) => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={cn(
            "searchable-select__value",
            !selectedOption && !value && "searchable-select__placeholder"
          )}
        >
          {displayLabel}
        </span>
        <ChevronDown size={16} className="searchable-select__chevron" aria-hidden />
      </button>

      {open ? (
        <div className="searchable-select__dropdown" role="presentation">
          <label className="searchable-select__search">
            <Search size={14} aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlightIndex(0);
              }}
              placeholder={searchPlaceholder}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={listboxId}
            />
          </label>
          <ul id={listboxId} className="searchable-select__list" role="listbox" aria-label={label ?? placeholder}>
            {options.length === 0 ? (
              <li className="searchable-select__empty" role="presentation">
                {emptyMessage}
              </li>
            ) : selectableRows.length === 0 ? (
              <li className="searchable-select__empty" role="presentation">
                {emptySearchMessage}
              </li>
            ) : (
              selectableRows.map((row, index) => {
                const selected = row.value === value;
                const highlighted = index === highlightIndex;
                return (
                  <li key={row.isEmpty ? "__empty__" : row.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        "searchable-select__option",
                        selected && "is-selected",
                        highlighted && "is-highlighted"
                      )}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectValue(row.value)}
                    >
                      {row.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );

  if (compact) {
    return (
      <label className="flex w-full flex-col gap-1.5 sm:w-auto">
        {label ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        ) : null}
        {control}
      </label>
    );
  }

  if (label) {
    return (
      <label className="form-field">
        <span>{label}</span>
        {control}
      </label>
    );
  }

  return control;
}
