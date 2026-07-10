import { motion } from "framer-motion";
import {
  BookOpen,
  Eye,
  MessageCircle,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useAuth } from "../../features/auth/AuthContext";
import {
  CHART_COLORS,
  CHART_PRIMARY,
  CHART_SECONDARY,
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
import type {
  DashboardDayCount,
  DashboardTopBook,
  DashboardTopCommenter
} from "../../types/dashboard";
import { DashboardChartCard } from "../components/dashboard/DashboardChartCard";
import { DashboardStatCard } from "../components/dashboard/DashboardStatCard";
import { DashboardWelcomeBanner } from "../components/dashboard/DashboardWelcomeBanner";
import { DataTable, type DataTableColumn } from "../components/table/DataTable";
import { Alert, Button, Card, CardHeader, PageShell, Skeleton } from "../../shared/ui";
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

function downloadCsv(filename: string, header: string[], rows: Array<Array<string | number>>): void {
  const csvBody = [header, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          return `"${text.replace(/"/g, "\"\"")}"`;
        })
        .join(";")
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${csvBody}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function DashboardSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Carregando dashboard">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`metric-${index}`} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 rounded-2xl xl:col-span-8" />
        <Skeleton className="h-80 rounded-2xl xl:col-span-4" />
      </div>
    </section>
  );
}

export function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setSearchParams] = useSearchParams();
  const exportToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exportToast, setExportToast] = useState("");
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

  useEffect(() => {
    return () => {
      if (exportToastTimerRef.current) clearTimeout(exportToastTimerRef.current);
    };
  }, []);

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
        to: "/comentarios?status=1"
      },
      {
        title: "Visualizacoes",
        value: totals.totalBookViews.toLocaleString("pt-BR"),
        hint: `Media ${totals.averageViewsPerActiveBook.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por livro`,
        icon: Eye,
        tone: "warning" as const
      }
    ];
  }, [summary, periodDays]);

  const secondaryStats = useMemo(() => {
    if (!summary) return [];
    const { totals } = summary;
    return [
      { label: "Livros inativos", value: totals.inactiveBooks },
      { label: "Sem categoria", value: totals.booksWithoutCategory },
      { label: "Comentarios publicados", value: totals.publishedComments }
    ];
  }, [summary]);

  const booksByCategoryChart = useMemo(() => {
    if (!summary) return [];
    return summary.booksByCategory.map((row, index) => ({
      name: shortLabel(row.categoryName || row.categoryId || "Sem categoria", 16),
      value: Number(row.bookCount),
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [summary]);

  const commentsByDayChart = useMemo(() => {
    if (!summary) return [];
    return summary.commentsByDay.map((row: DashboardDayCount) => ({
      day: row.day.length >= 10 ? row.day.slice(5) : row.day,
      comentarios: Number(row.commentCount)
    }));
  }, [summary]);

  const commentsTrendLine = useMemo(() => {
    if (!summary) return [];
    let acc = 0;
    return summary.commentsByDay.map((row) => {
      acc += Number(row.commentCount);
      return {
        day: row.day.length >= 10 ? row.day.slice(5) : row.day,
        acumulado: acc,
        comentarios: Number(row.commentCount)
      };
    });
  }, [summary]);

  const topBooksBar = useMemo(() => {
    if (!summary) return [];
    return summary.topBooks.slice(0, 8).map((book) => ({
      nome: shortLabel(decodeHtmlEntities(book.title), 28),
      views: Number(book.views)
    }));
  }, [summary]);

  const topBookRows: DashboardTopBook[] = useMemo(() => {
    if (!summary) return [];
    return summary.topBooks.map((book) => ({
      title: decodeHtmlEntities(book.title),
      views: Number(book.views),
      categoryId: book.categoryId,
      categoryName: decodeHtmlEntities(book.categoryName)
    }));
  }, [summary]);

  const topCommenterRows: DashboardTopCommenter[] = useMemo(() => {
    if (!summary) return [];
    return summary.topCommenters.map((row) => ({
      name: decodeHtmlEntities(row.name),
      commentCount: Number(row.commentCount)
    }));
  }, [summary]);

  const topBookColumns = useMemo<DataTableColumn<DashboardTopBook>[]>(
    () => [
      { key: "title", label: "Titulo", render: (book) => book.title },
      { key: "category", label: "Categoria", render: (book) => book.categoryName || "Sem categoria" },
      {
        key: "views",
        label: "Visualizacoes",
        align: "right",
        render: (book) => book.views.toLocaleString("pt-BR")
      }
    ],
    []
  );

  const topCommenterColumns = useMemo<DataTableColumn<DashboardTopCommenter>[]>(
    () => [
      { key: "name", label: "Usuario", render: (user) => user.name },
      {
        key: "comments",
        label: "Comentarios",
        align: "right",
        render: (user) => user.commentCount.toLocaleString("pt-BR")
      }
    ],
    []
  );

  function showExportToast(filename: string): void {
    if (exportToastTimerRef.current) clearTimeout(exportToastTimerRef.current);
    setExportToast(`Ficheiro exportado: ${filename}`);
    exportToastTimerRef.current = setTimeout(() => {
      setExportToast("");
      exportToastTimerRef.current = null;
    }, 3200);
  }

  function exportTopBooksCsv(): void {
    if (!summary) return;
    const filename = `dashboard-top-livros-${periodDays}d.csv`;
    downloadCsv(
      filename,
      ["Titulo", "Categoria", "Visualizacoes"],
      summary.topBooks.map((book) => [book.title, book.categoryName || "Sem categoria", Number(book.views)])
    );
    showExportToast(filename);
  }

  function exportTopCommentersCsv(): void {
    if (!summary) return;
    const filename = `dashboard-top-comentarios-${periodDays}d.csv`;
    downloadCsv(
      filename,
      ["Usuario", "Comentarios"],
      summary.topCommenters.map((row) => [row.name, Number(row.commentCount)])
    );
    showExportToast(filename);
  }

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
        {exportToast ? (
          <div className="export-toast" role="status" aria-live="polite">
            {exportToast}
          </div>
        ) : null}

        <DashboardWelcomeBanner
          name={user?.name || user?.username || "Administrador"}
          periodDays={periodDays}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryStats.map((item, index) => (
            <DashboardStatCard
              key={item.title}
              {...item}
              index={index}
              onNavigate={navigate}
            />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {secondaryStats.map((item) => (
            <Card key={item.label} elevated padding="md" className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{item.label}</p>
                <p className="text-xl font-bold text-foreground">{item.value.toLocaleString("pt-BR")}</p>
              </div>
              <TrendingUp size={18} className="shrink-0 text-primary" />
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <DashboardChartCard
            className="xl:col-span-8"
            title="Engajamento — comentarios por dia"
            description={`Volume diario e tendencia acumulada (${periodDays} dias)`}
          >
            {commentsByDayChart.length === 0 ? (
              <p className="flex h-full items-center text-sm text-muted">Sem comentarios no periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commentsTrendLine} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_SUCCESS} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_SUCCESS} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="comentarios"
                    name="Comentarios/dia"
                    stroke={CHART_SUCCESS}
                    fill="url(#commentsGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="acumulado"
                    name="Acumulado"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </DashboardChartCard>

          <DashboardChartCard
            className="xl:col-span-4"
            title="Livros por categoria"
            description="Distribuicao do catalogo ativo"
            heightClassName="h-[280px] md:h-[320px]"
          >
            {booksByCategoryChart.length === 0 ? (
              <p className="flex h-full items-center text-sm text-muted">Sem dados para o grafico.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={booksByCategoryChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {booksByCategoryChart.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </DashboardChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardChartCard
            title="Top livros por visualizacoes"
            description="Os 8 titulos mais acessados"
            actions={
              <Button type="button" variant="secondary" size="sm" onClick={exportTopBooksCsv}>
                Exportar CSV
              </Button>
            }
          >
            {topBooksBar.length === 0 ? (
              <p className="flex h-full items-center text-sm text-muted">Sem livros para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topBooksBar} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="views" name="Views" fill={CHART_WARNING} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardChartCard>

          <DashboardChartCard title="Comentarios — comparativo diario" description="Barras por dia no periodo">
            {commentsByDayChart.length === 0 ? (
              <p className="flex h-full items-center text-sm text-muted">Sem comentarios no periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commentsByDayChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="comentarios"
                    name="Comentarios"
                    stroke={CHART_SECONDARY}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </DashboardChartCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card elevated padding="lg" className="xl:col-span-1">
            <CardHeader title="Atividade recente" description="Ultimas acoes no painel" />
            {summary.recentActivities.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma atividade recente.</p>
            ) : (
              <ul className="activity-list max-h-[360px] overflow-y-auto pr-1">
                {summary.recentActivities.map((activity, index) => (
                  <li key={`${activity.module}-${activity.time}-${index}`}>
                    <div>
                      <strong>{activity.action}</strong>
                      <p className="text-xs text-muted">
                        {activity.module} • {activity.user}
                      </p>
                    </div>
                    <span className="text-xs text-muted">{activity.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card elevated padding="lg" className="xl:col-span-2 min-w-0">
            <CardHeader title="Livros mais acessados" />
            <DataTable<DashboardTopBook>
              columns={topBookColumns}
              data={topBookRows}
              keyExtractor={(book) => `${book.title}|${book.categoryId}|${book.views}`}
              emptyMessage="Nenhum livro ativo encontrado."
              renderMobileCard={(book) => (
                <article className="book-card dashboard-mini-card">
                  <div className="book-card-body">
                    <h3>{book.title}</h3>
                    <p className="book-card-author">Categoria: {book.categoryName || "Sem categoria"}</p>
                    <p className="dashboard-mini-metric">
                      <strong>{book.views.toLocaleString("pt-BR")}</strong> visualizacoes
                    </p>
                  </div>
                </article>
              )}
            />
          </Card>
        </div>

        <Card elevated padding="lg">
          <CardHeader
            title="Usuarios com mais comentarios"
            actions={
              <Button type="button" variant="secondary" size="sm" onClick={exportTopCommentersCsv}>
                Exportar CSV
              </Button>
            }
          />
          <DataTable<DashboardTopCommenter>
            columns={topCommenterColumns}
            data={topCommenterRows}
            keyExtractor={(user) => `${user.name}|${user.commentCount}`}
            emptyMessage="Nenhum comentario com usuario vinculado."
            renderMobileCard={(user) => (
              <article className="book-card dashboard-mini-card">
                <div className="book-card-body">
                  <h3>{user.name}</h3>
                  <p className="dashboard-mini-metric">
                    <strong>{user.commentCount.toLocaleString("pt-BR")}</strong> comentarios
                  </p>
                </div>
              </article>
            )}
          />
        </Card>
      </motion.div>
    </PageShell>
  );
}
