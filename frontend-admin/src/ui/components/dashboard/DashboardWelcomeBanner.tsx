import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type DashboardWelcomeBannerProps = {
  name: string;
  periodDays: number;
};

export function DashboardWelcomeBanner({ name, periodDays }: DashboardWelcomeBannerProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <motion.section
      className="berry-welcome-banner relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 p-5 text-white shadow-card md:p-6 lg:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-16 h-32 w-32 rounded-full bg-indigo-300/20 blur-xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles size={14} />
            Painel Libare Digital
          </div>
          <h1 className="text-xl font-bold md:text-2xl lg:text-3xl">Ola, {firstName}!</h1>
          <p className="max-w-xl text-sm text-violet-100/90 md:text-base">
            Visao consolidada dos ultimos {periodDays} dias — catalogo, usuarios e engajamento.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:max-w-md md:flex-1">
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
            <p className="text-xs text-violet-100/80">Periodo</p>
            <p className="text-lg font-bold">{periodDays}d</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
            <p className="text-xs text-violet-100/80">Modo</p>
            <p className="text-lg font-bold">Tempo real</p>
          </div>
          <div className="col-span-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm sm:col-span-1">
            <p className="text-xs text-violet-100/80">Template</p>
            <p className="text-lg font-bold">Berry</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
