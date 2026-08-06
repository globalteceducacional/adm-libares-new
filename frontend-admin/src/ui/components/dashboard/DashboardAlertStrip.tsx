import { AlertTriangle, FolderX, PowerOff } from "lucide-react";
import { motion } from "framer-motion";

export type DashboardAlertItem = {
  id: string;
  label: string;
  value: number;
  hint?: string;
  to?: string;
  icon: "inactive" | "uncategorized";
};

type DashboardAlertStripProps = {
  items: DashboardAlertItem[];
  onNavigate?: (path: string) => void;
};

const iconMap = {
  inactive: PowerOff,
  uncategorized: FolderX
};

export function DashboardAlertStrip({ items, onNavigate }: DashboardAlertStripProps) {
  const visible = items.filter((item) => item.value > 0);
  if (visible.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-4 md:p-5"
      aria-label="Pontos de atencao do catalogo"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <AlertTriangle size={16} className="text-warning" />
        Atencao no catalogo
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((item, index) => {
          const Icon = iconMap[item.icon];
          const clickable = Boolean(item.to && onNavigate);
          return (
            <motion.button
              key={item.id}
              type="button"
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary/40 disabled:cursor-default"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
              disabled={!clickable}
              onClick={() => item.to && onNavigate?.(item.to)}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{item.label}</p>
                <p className="text-xl font-bold text-foreground">{item.value.toLocaleString("pt-BR")}</p>
                {item.hint ? <p className="text-xs text-muted">{item.hint}</p> : null}
              </div>
              <Icon size={18} className="shrink-0 text-muted" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
