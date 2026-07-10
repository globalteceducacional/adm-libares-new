import { Search, X } from "lucide-react";
import { cn } from "../../../shared/lib/cn";

type SidebarSearchProps = {
  value: string;
  onChange: (value: string) => void;
  collapsed: boolean;
};

export function SidebarSearch({ value, onChange, collapsed }: SidebarSearchProps) {
  if (collapsed) {
    return null;
  }

  return (
    <div className="relative mt-3">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-muted"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar no menu..."
        aria-label="Buscar no menu de navegacao"
        className={cn(
          "h-10 w-full rounded-xl border border-white/10 bg-sidebar-input pl-9 pr-9 text-sm text-sidebar-foreground",
          "placeholder:text-sidebar-muted focus:border-sidebar-accent focus:outline-none focus:ring-2 focus:ring-sidebar-accent/30"
        )}
      />
      {value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          onClick={() => onChange("")}
          aria-label="Limpar busca do menu"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
