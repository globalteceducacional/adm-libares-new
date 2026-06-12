import { motion } from "framer-motion";
import { BookOpen, Eye, MessageCircle, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getQueryErrorMessage,
  useDashboardQuery
} from "../../features/shared/api/queries";
import type {
  DashboardDayCount,
  DashboardTopBook,
  DashboardTopCommenter
} from "../../types/dashboard";
import { DataTable, type DataTableColumn } from "../components/table/DataTable";
import { Skeleton } from "../../shared/ui";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function DashboardSkeleton() {
  return (
    <section className="dashboard-skeleton" aria-busy="true" aria-label="Carregando dashboard">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={`metric-${index}`} className="skeleton-card" />
      ))}
      <Skeleton className="skeleton-chart" />
      <Skeleton className="skeleton-chart" />
    </section>
  );
}

function shortLabel(value: string, max = 14): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed || "—";
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

type DashboardPeriod = 7 | 30 | 90;
const DASHBOARD_PERIOD_KEY = "adm-libare-dashboard-period";

function isDashboardPeriod(value: number): value is DashboardPeriod {
  return value === 7 || value === 30 || value === 90;
}

function parsePeriodParam(raw: string | null): DashboardPeriod | null {
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isInteger(parsed) && isDashboardPeriod(parsed) ? parsed : null;
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

export function DashboardPage() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const exportToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exportToast, setExportToast] = useState("");
  const [periodDays, setPeriodDays] = useState<DashboardPeriod>(() => {
    const fromQuery = parsePeriodParam(new URLSearchParams(window.location.search).get("period"));
    if (fromQuery) {
      return fromQuery;
    }
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
      if (exportToastTimerRef.current) {
        clearTimeout(exportToastTimerRef.current);
      }
    };
  }, []);

  const stats = useMemo(() => {
    if (!summary) {
      return [];
    }
    const { totals } = summary;
    const commentsDelta = totals.commentsLast7Days - totals.commentsPrevious7Days;
    const commentsDeltaSignal =
      commentsDelta > 0
        ? `+${commentsDelta.toLocaleString("pt-BR")} vs periodo anterior`
        : commentsDelta < 0
          ? `${commentsDelta.toLocaleString("pt-BR")} vs periodo anterior`
          : "mesmo volume do periodo anterior";

    return [
      {
        title: "Livros ativos",
        value: totals.activeBooks.toLocaleString("pt-BR"),
        hint: "catalog_books.is_active = 1",
        icon: BookOpen,
        to: "/livros?status=1"
      },
      {
        title: "Livros inativos",
        value: totals.inactiveBooks.toLocaleString("pt-BR"),
        hint: "catalog_books.is_active = 0",
        icon: BookOpen,
        to: "/livros?status=0"
      },
      {
        title: "Livros em destaque",
        value: totals.featuredBooks.toLocaleString("pt-BR"),
        hint: "is_featured = 1",
        icon: BookOpen
      },
      {
        title: "Livros sem categoria",
        value: totals.booksWithoutCategory.toLocaleString("pt-BR"),
        hint: "higiene de catalogo",
        icon: BookOpen
      },
      {
        title: "Usuarios ativos",
        value: totals.activeUsers.toLocaleString("pt-BR"),
        hint: "app_users.is_active = 1",
        icon: Users,
        to: "/usuarios?status=1"
      },
      {
        title: `Usuarios ativos (${periodDays}d)`,
        value: totals.activeUsersLast30Days.toLocaleString("pt-BR"),
        hint: `usuarios com atividade nos ultimos ${periodDays} dias`,
        icon: Users,
        to: "/usuarios?status=1"
      },
      {
        title: `Comentarios (${periodDays} dias)`,
        value: totals.commentsLast7Days.toLocaleString("pt-BR"),
        hint: commentsDeltaSignal,
        icon: MessageCircle,
        to: "/comentarios?status=1"
      },
      {
        title: "Media de views por livro ativo",
        value: totals.averageViewsPerActiveBook.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
        hint: "AVG(views) do catalogo ativo",
        icon: Eye
      },
      {
        title: "Visualizacoes totais",
        value: totals.totalBookViews.toLocaleString("pt-BR"),
        hint: "SUM(views) do catalogo ativo",
        icon: Eye
      },
      {
        title: "Comentarios publicados (total)",
        value: totals.publishedComments.toLocaleString("pt-BR"),
        hint: "engagement_comments.is_active = 1",
        icon: MessageCircle,
        to: "/comentarios?status=1"
      }
    ];
  }, [summary, periodDays]);

  const booksByCategoryChart = useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.booksByCategory.map((row) => ({
      label: shortLabel(row.categoryName || row.categoryId || "Sem categoria", 18),
      count: Number(row.bookCount)
    }));
  }, [summary]);

  const commentsByDayChart = useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.commentsByDay.map((row: DashboardDayCount) => ({
      day: row.day.length >= 10 ? row.day.slice(5) : row.day,
      comentarios: Number(row.commentCount)
    }));
  }, [summary]);

  const topBooksBar = useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.topBooks.slice(0, 8).map((book) => ({
      nome: shortLabel(book.title, 28),
      views: Number(book.views)
    }));
  }, [summary]);

  const topBookRows: DashboardTopBook[] = useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.topBooks.map((book) => ({
      title: book.title,
      views: Number(book.views),
      categoryId: book.categoryId,
      categoryName: book.categoryName
    }));
  }, [summary]);

  const topCommenterRows: DashboardTopCommenter[] = useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.topCommenters.map((row) => ({
      name: row.name,
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

  function handlePeriodChange(nextPeriod: DashboardPeriod): void {
    setPeriodDays(nextPeriod);
  }

  /** Confirmação breve após exportar CSV (sem dependências externas). */
  function showExportToast(filename: string): void {
    if (exportToastTimerRef.current) {
      clearTimeout(exportToastTimerRef.current);
    }
    setExportToast(`Ficheiro exportado: ${filename}`);
    exportToastTimerRef.current = setTimeout(() => {
      setExportToast("");
      exportToastTimerRef.current = null;
    }, 3200);
  }

  function exportTopBooksCsv(): void {
    if (!summary) {
      return;
    }
    const filename = `dashboard-top-livros-${periodDays}d.csv`;
    downloadCsv(
      filename,
      ["Titulo", "Categoria", "Visualizacoes"],
      summary.topBooks.map((book) => [book.title, book.categoryName || "Sem categoria", Number(book.views)])
    );
    showExportToast(filename);
  }

  function exportTopCommentersCsv(): void {
    if (!summary) {
      return;
    }
    const filename = `dashboard-top-comentarios-${periodDays}d.csv`;
    downloadCsv(
      filename,
      ["Usuario", "Comentarios"],
      summary.topCommenters.map((row) => [row.name, Number(row.commentCount)])
    );
    showExportToast(filename);
  }

  function exportCommentsByDayCsv(): void {
    if (!summary) {
      return;
    }
    const filename = `dashboard-comentarios-por-dia-${periodDays}d.csv`;
    downloadCsv(
      filename,
      ["Dia", "Comentarios"],
      summary.commentsByDay.map((row) => [row.day, Number(row.commentCount)])
    );
    showExportToast(filename);
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !summary) {
    return (
      <motion.section
        className="dashboard-page"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <article className="card page-card elevated">
          <h2>Dashboard</h2>
          <p className="error-text">{error || "Nao foi possivel carregar os dados."}</p>
        </article>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="dashboard-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      {exportToast ? (
        <div className="export-toast" role="status" aria-live="polite">
          {exportToast}
        </div>
      ) : null}
      <div className="dashboard-grid">
        {stats.map((item, index) => (
          <motion.article
            key={item.title}
            className={`card stat-card elevated${item.to ? " stat-card-link" : ""}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index, duration: 0.28 }}
            whileHover={{ y: -3 }}
            onClick={() => {
              if (item.to) {
                navigate(item.to);
              }
            }}
            role={item.to ? "button" : undefined}
            tabIndex={item.to ? 0 : undefined}
            onKeyDown={(event) => {
              if (!item.to) {
                return;
              }
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(item.to);
              }
            }}
          >
            <div className="stat-head">
              <p className="card-label">{item.title}</p>
              <div className="stat-icon">
                <item.icon size={16} />
              </div>
            </div>
            <strong className="card-value">{item.value}</strong>
            <small className="muted-text">{item.hint}</small>
          </motion.article>
        ))}
      </div>

      <div className="chart-grid">
        <article className="card page-card elevated">
          <div className="card-header">
            <h2>Livros ativos por categoria</h2>
            <div className="period-switch">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  className={periodDays === days ? "primary-btn period-btn" : "secondary-btn period-btn"}
                  onClick={() => handlePeriodChange(days as DashboardPeriod)}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
          <div className="chart-shell">
            {booksByCategoryChart.length === 0 ? (
              <p className="muted-text">Sem dados suficientes para o grafico.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={booksByCategoryChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" interval={0} angle={-18} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#5e35b1" radius={[10, 10, 0, 0]} animationDuration={700} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="card page-card elevated">
          <div className="card-header">
            <h2>Comentarios publicados (ultimos {periodDays} dias)</h2>
            <button type="button" className="secondary-btn period-btn" onClick={exportCommentsByDayCsv}>
              Exportar CSV
            </button>
          </div>
          <div className="chart-shell">
            {commentsByDayChart.length === 0 ? (
              <p className="muted-text">Sem comentarios no periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={commentsByDayChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="comentarios" fill="#1fb2a5" radius={[10, 10, 0, 0]} animationDuration={760} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </div>

      <div className="chart-grid">
        <article className="card page-card elevated">
          <div className="card-header">
            <h2>Top livros por visualizacoes</h2>
            <button type="button" className="secondary-btn period-btn" onClick={exportTopBooksCsv}>
              Exportar CSV
            </button>
          </div>
          <div className="chart-shell">
            {topBooksBar.length === 0 ? (
              <p className="muted-text">Sem livros para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart layout="vertical" data={topBooksBar} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="nome" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#ff8f00" radius={[0, 10, 10, 0]} animationDuration={780} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="card page-card elevated">
          <div className="card-header">
            <h2>Atividade recente</h2>
          </div>
          {summary.recentActivities.length === 0 ? (
            <p className="muted-text">Nenhuma atividade recente encontrada.</p>
          ) : (
            <ul className="activity-list">
              {summary.recentActivities.map((activity, index) => (
                <li key={`${activity.module}-${activity.time}-${index}`}>
                  <div>
                    <strong>{activity.action}</strong>
                    <p>
                      {activity.module} • {activity.user}
                    </p>
                  </div>
                  <span>{activity.time}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <article className="card page-card elevated">
        <div className="card-header">
          <h2>Livros mais acessados</h2>
        </div>
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
      </article>

      <article className="card page-card elevated">
        <div className="card-header">
          <h2>Usuarios com mais comentarios</h2>
          <button type="button" className="secondary-btn period-btn" onClick={exportTopCommentersCsv}>
            Exportar CSV
          </button>
        </div>
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
      </article>
    </motion.section>
  );
}
