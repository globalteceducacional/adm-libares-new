import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  CHART_SUCCESS,
  CHART_WARNING,
  chartGridStroke,
  chartTooltipStyle
} from "../../features/dashboard/config/chartTheme";
import {
  getQueryErrorMessage,
  useDashboardQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import type { DashboardDayCount } from "../../types/dashboard";
import { DashboardAlertStrip } from "../components/dashboard/DashboardAlertStrip";
import { DashboardChartCard } from "../components/dashboard/DashboardChartCard";
import { DashboardStatCard } from "../components/dashboard/DashboardStatCard";
import { Alert, Button, PageShell, Skeleton } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";

type DashboardPeriod = 7 | 30 | 90;
const DASHBOARD_PERIOD_KEY = "adm-libare-dashboard-period";

function isDashboardPeriod(value: number): value is DashboardPeriod {
  return value === 7 || value === 30 || value === 90;
}

function parsePeriodParam(raw: string | null): DashboardPeriod | null {
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && isDashboardPeriod(parsed) ? parsed : null;
}

function shortLabel(value: string, max = 14): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed || "—";
  return `${trimmed.slice(0, max - 1)}…`;
}

function DashboardSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Carregando dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`metric-${index}`} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 rounded-2xl xl:col-span-8" />
        <Skeleton className="h-80 rounded-2xl xl:col-span-4" />
      </div>
      <Skeleton className="h-28 rounded-2xl" />
    </section>
  );
}

export function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [periodDays, setPeriodDays] = useState<DashboardPeriod>(() => {
    const fromQuery = parsePeriodParam(new URLSearchParams(window.location.search).get("period"));
    if (fromQuery) return fromQuery;
    const fromStorage = parsePeriodParam(window.localStorage.getItem(DASHBOARD_PERIOD_KEY));
    return fromStorage ?? 30;
  });

  useEffect(() => {
    window.localStorage.setItem(DASHBOARD_PERIOD_KEY, String(periodDays));
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("period", String(periodDays));
    setSearchParams(nextParams, { replace: true });
  }, [periodDays, setSearchParams]);

  const dashboardQuery = useDashboardQuery(periodDays);
  const summary = dashboardQuery.data ?? null;
  const loading = dashboardQuery.isLoading;
  const error = dashboardQuery.error
    ? getQueryErrorMessage(dashboardQuery.error, "Falha ao carregar dashboard")
    : "";

  const primaryStats = useMemo(() => {
    if (!summary) return [];
    const { totals } = summary;
    const commentsDelta = totals.commentsLast7Days - totals.commentsPrevious7Days;

    return [
      {
        title: "Livros ativos",
        value: totals.activeBooks.toLocaleString("pt-BR"),
        hint: `${totals.featuredBooks.toLocaleString("pt-BR")} em destaque`,
        icon: BookOpen,
        tone: "primary" as const,
        to: "/livros?status=1"
      },
      {
        title: "Usuarios ativos",
        value: totals.activeUsers.toLocaleString("pt-BR"),
        hint: `${totals.activeUsersLast30Days.toLocaleString("pt-BR")} com atividade recente`,
        icon: Users,
        tone: "info" as const,
        to: "/usuarios?status=1"
      },
      {
        title: "Comentarios",
        value: totals.commentsLast7Days.toLocaleString("pt-BR"),
        hint: `Ultimos ${periodDays} dias`,
        icon: MessageCircle,
        tone: "success" as const,
        delta: commentsDelta,
        to: "/comentarios"
      }
    ];
  }, [summary, periodDays]);

  const commentsByDayChart = useMemo(() => {
    if (!summary) return [];
    return summary.commentsByDay.map((row: DashboardDayCount) => ({
      day: row.day.length >= 10 ? row.day.slice(5) : row.day,
      comentarios: Number(row.commentCount)
    }));
  }, [summary]);

  const topBooksBar = useMemo(() => {
    if (!summary) return [];
    return summary.topBooks.slice(0, 5).map((book) => ({
      nome: shortLabel(decodeHtmlEntities(book.title), 22),
      views: Number(book.views)
    }));
  }, [summary]);

  const alertItems = useMemo(() => {
    if (!summary) return [];
    return [
      {
        id: "inactive",
        label: "Livros inativos",
        value: summary.totals.inactiveBooks,
        hint: "Revisar catalogo desativado",
        to: "/livros?status=0",
        icon: "inactive" as const
      },
      {
        id: "uncategorized",
        label: "Sem categoria",
        value: summary.totals.booksWithoutCategory,
        hint: "Livros ativos sem categoria",
        icon: "uncategorized" as const
      }
    ];
  }, [summary]);

  const dashboardShell = {
    title: "Dashboard",
    description: "Metricas e graficos de desempenho da plataforma.",
    breadcrumbs: buildBreadcrumbs(location.pathname)
  };

  const periodActions = (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1 shadow-sm">
      {([7, 30, 90] as DashboardPeriod[]).map((days) => (
        <Button
          key={days}
          type="button"
          variant={periodDays === days ? "primary" : "ghost"}
          size="sm"
          className="min-w-[72px]"
          onClick={() => setPeriodDays(days)}
        >
          {days}d
        </Button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <PageShell {...dashboardShell} actions={periodActions}>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (error || !summary) {
    return (
      <PageShell {...dashboardShell} actions={periodActions}>
        <Alert tone="danger">{error || "Nao foi possivel carregar os dados."}</Alert>
      </PageShell>
    );
  }

  return (
    <PageShell {...dashboardShell} actions={periodActions}>
      <motion.div
        className="dashboard-page space-y-4 md:space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {primaryStats.map((item, index) => (
            <DashboardStatCard key={item.title} {...item} index={index} onNavigate={navigate} />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <DashboardChartCard
            className="xl:col-span-8"
            title="Comentarios por dia"
            description={`Volume diario nos ultimos ${periodDays} dias`}
          >
            {commentsByDayChart.length === 0 ? (
              <p className="flex h-full items-center text-sm text-muted">Sem comentarios no periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commentsByDayChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_SUCCESS} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_SUCCESS} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="comentarios"
                    name="Comentarios"
                    stroke={CHART_SUCCESS}
                    fill="url(#commentsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </DashboardChartCard>

          <DashboardChartCard
            className="xl:col-span-4"
            title="Top 5 livros"
            description="Mais visualizados"
            heightClassName="h-[280px] md:h-[320px]"
          >
            {topBooksBar.length === 0 ? (
              <p className="flex h-full items-center text-sm text-muted">Sem livros para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topBooksBar} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="nome" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="views" name="Views" fill={CHART_WARNING} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardChartCard>
        </div>

        <DashboardAlertStrip items={alertItems} onNavigate={navigate} />
      </motion.div>
    </PageShell>
  );
}
