import type { LucideIcon } from "lucide-react";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type TabItem<TId extends string = string> = {
  id: TId;
  label: string;
  icon?: LucideIcon;
  /** Contador exibido ao lado do label (ex.: total de registros). */
  count?: number;
};

type TabsProps<TId extends string> = {
  /** Prefixo estavel usado para ligar tab <-> painel (mesmo valor no TabPanel). */
  id: string;
  items: TabItem<TId>[];
  value: TId;
  onChange: (id: TId) => void;
  /** Rotulo acessivel do tablist. */
  ariaLabel: string;
  className?: string;
};

function tabElementId(prefix: string, tabId: string) {
  return `${prefix}-tab-${tabId}`;
}

function panelElementId(prefix: string, tabId: string) {
  return `${prefix}-panel-${tabId}`;
}

/**
 * Tablist controlado (WAI-ARIA): setas esquerda/direita, Home/End navegam e ativam.
 * Use `TabPanel` com o mesmo `id` para o conteudo da aba ativa.
 */
export function Tabs<TId extends string>({ id, items, value, onChange, ariaLabel, className }: TabsProps<TId>) {
  const listRef = useRef<HTMLDivElement>(null);

  function focusAndSelect(index: number) {
    const item = items[index];
    if (!item) {
      return;
    }
    onChange(item.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabElementId(id, item.id))}`)
      ?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = items.findIndex((item) => item.id === value);
    if (currentIndex < 0) {
      return;
    }
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusAndSelect((currentIndex + 1) % items.length);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusAndSelect((currentIndex - 1 + items.length) % items.length);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(items.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface-2/60 p-1",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const selected = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={tabElementId(id, item.id)}
            aria-selected={selected}
            aria-controls={panelElementId(id, item.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex min-w-0 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              selected
                ? "bg-surface text-primary shadow-sm"
                : "text-muted hover:bg-surface hover:text-foreground"
            )}
          >
            {Icon ? <Icon size={16} aria-hidden="true" /> : null}
            <span className="truncate">{item.label}</span>
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs tabular-nums",
                  selected ? "bg-primary/10 text-primary" : "bg-surface text-muted"
                )}
              >
                {item.count.toLocaleString("pt-BR")}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type TabPanelProps = {
  /** Mesmo prefixo passado ao Tabs. */
  id: string;
  /** Id da aba a que este painel pertence. */
  tabId: string;
  children: ReactNode;
  className?: string;
};

export function TabPanel({ id, tabId, children, className }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelElementId(id, tabId)}
      aria-labelledby={tabElementId(id, tabId)}
      tabIndex={0}
      className={cn("outline-none", className)}
    >
      {children}
    </div>
  );
}
