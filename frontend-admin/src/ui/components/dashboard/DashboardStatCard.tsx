import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../../shared/lib/cn";

type DashboardStatCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "info" | "success" | "warning";
  delta?: number;
  to?: string;
  onNavigate?: (path: string) => void;
  index?: number;
};

const toneStyles = {
  primary: "from-violet-600/15 to-violet-600/5 text-violet-700 dark:text-violet-300",
  info: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-300",
  success: "from-teal-500/15 to-teal-500/5 text-teal-700 dark:text-teal-300",
  warning: "from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-300"
};

const iconToneStyles = {
  primary: "bg-violet-600 text-white shadow-lg shadow-violet-600/30",
  info: "bg-sky-500 text-white shadow-lg shadow-sky-500/30",
  success: "bg-teal-500 text-white shadow-lg shadow-teal-500/30",
  warning: "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
};

export function DashboardStatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delta,
  to,
  onNavigate,
  index = 0
}: DashboardStatCardProps) {
  const clickable = Boolean(to && onNavigate);

  return (
    <motion.article
      className={cn(
        "berry-stat-card group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card transition-shadow md:p-5",
        "bg-gradient-to-br",
        toneStyles[tone],
        clickable && "cursor-pointer hover:shadow-lg"
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.28 }}
      whileHover={clickable ? { y: -2 } : undefined}
      onClick={() => to && onNavigate?.(to)}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(event) => {
        if (!to || !onNavigate) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNavigate(to);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted md:text-sm">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{value}</p>
          {hint ? <p className="text-xs text-muted line-clamp-2">{hint}</p> : null}
          {delta !== undefined ? (
            <p
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                delta >= 0 ? "text-success" : "text-danger"
              )}
            >
              {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {delta >= 0 ? "+" : ""}
              {delta.toLocaleString("pt-BR")} vs periodo anterior
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 md:h-12 md:w-12",
            iconToneStyles[tone]
          )}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.article>
  );
}
