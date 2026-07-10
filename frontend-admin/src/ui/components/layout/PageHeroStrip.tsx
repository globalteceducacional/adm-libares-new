import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../shared/lib/cn";

type PageHeroStripProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
  tone?: "primary" | "info" | "success" | "warning";
};

const toneMap = {
  primary: "from-violet-600/10 via-violet-500/5 to-transparent border-violet-500/20",
  info: "from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/20",
  success: "from-teal-500/10 via-teal-500/5 to-transparent border-teal-500/20",
  warning: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20"
};

const iconToneMap = {
  primary: "bg-violet-600 text-white shadow-violet-600/25",
  info: "bg-sky-500 text-white shadow-sky-500/25",
  success: "bg-teal-500 text-white shadow-teal-600/25",
  warning: "bg-amber-500 text-white shadow-amber-500/25"
};

export function PageHeroStrip({
  icon: Icon,
  title,
  description,
  actions,
  tone = "primary"
}: PageHeroStripProps) {
  return (
    <motion.section
      className={cn(
        "berry-page-hero relative overflow-hidden rounded-2xl border bg-gradient-to-r p-4 shadow-card md:p-5",
        toneMap[tone]
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 md:items-center">
          <div
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-lg md:h-12 md:w-12",
              iconToneMap[tone]
            )}
          >
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-foreground md:text-xl">{title}</h1>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </motion.section>
  );
}
