import { motion } from "framer-motion";

export type ListingMiniStat = {
  label: string;
  value: string | number;
  hint?: string;
};

type ListingMiniStatsProps = {
  items: ListingMiniStat[];
};

export function ListingMiniStats({ items }: ListingMiniStatsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 xs:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          className="berry-mini-stat rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * index, duration: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
          <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">
            {typeof item.value === "number" ? item.value.toLocaleString("pt-BR") : item.value}
          </p>
          {item.hint ? <p className="mt-0.5 text-xs text-muted">{item.hint}</p> : null}
        </motion.div>
      ))}
    </div>
  );
}
