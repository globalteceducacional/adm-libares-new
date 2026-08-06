# Dashboard enxuto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir `/dashboard` ao layout C — 3 KPIs + tendência de comentários + Top 5 livros + faixa de alertas.

**Architecture:** Reescrever `DashboardPage.tsx` em cima da API atual (`useDashboardQuery`). Extrair `DashboardAlertStrip` para a faixa operacional. Remover welcome, gráficos/tabelas duplicados, CSV e atividade recente. Sem mudanças de backend.

**Tech Stack:** React 18, Recharts, Framer Motion, `frontend-admin`.

**Spec:** `docs/superpowers/specs/2026-08-06-dashboard-enxuto-design.md`

**Verificação:** não há testes unitários no front — usar `cd frontend-admin ; npx tsc --noEmit` após cada task de código.

---

## File map

| Ação | Path |
|------|------|
| Create | `frontend-admin/src/ui/components/dashboard/DashboardAlertStrip.tsx` |
| Modify | `frontend-admin/src/ui/pages/DashboardPage.tsx` (reescrita) |
| Delete | `frontend-admin/src/ui/components/dashboard/DashboardWelcomeBanner.tsx` (só usado pelo dashboard) |

Manter: `DashboardStatCard.tsx`, `DashboardChartCard.tsx`, `chartTheme.ts`, `types/dashboard.ts`, `dashboardService.ts`.

---

### Task 1: DashboardAlertStrip

**Files:**
- Create: `frontend-admin/src/ui/components/dashboard/DashboardAlertStrip.tsx`

- [ ] **Step 1: Criar o componente**

Faixa com 2 chips/cards clicáveis: livros inativos e livros sem categoria.

```tsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add frontend-admin/src/ui/components/dashboard/DashboardAlertStrip.tsx
git commit -m "feat(admin): DashboardAlertStrip para atencao do catalogo"
```

---

### Task 2: Reescrever DashboardPage (layout C)

**Files:**
- Modify: `frontend-admin/src/ui/pages/DashboardPage.tsx`
- Delete: `frontend-admin/src/ui/components/dashboard/DashboardWelcomeBanner.tsx`

- [ ] **Step 1: Substituir o conteúdo de `DashboardPage.tsx`**

Manter helpers de período (`DashboardPeriod`, `DASHBOARD_PERIOD_KEY`, `parsePeriodParam`, `isDashboardPeriod`, `shortLabel`). Remover `downloadCsv`, export toast, secondary stats, pie, line duplicada, tabelas, welcome.

Estrutura alvo (implementar completa no arquivo):

```tsx
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

// ... period helpers iguais aos atuais (isDashboardPeriod, parsePeriodParam, shortLabel, DASHBOARD_PERIOD_KEY)

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
  // period state + localStorage/URL sync (copiar do atual)
  // useDashboardQuery(periodDays)

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
        to: "/livros?status=1",
        icon: "uncategorized" as const
      }
    ];
  }, [summary]);

  // loading / error shells iguais, periodActions iguais

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
```

Importante na reescrita completa:
1. Copiar o bloco de estado de período / `useEffect` URL+localStorage do arquivo atual.
2. Não importar `DashboardWelcomeBanner`, `DataTable`, `Card`, `Legend`, `Pie`, `Line`, `Cell`, `TrendingUp`, `Eye`.
3. Área do gráfico: **só** `comentarios` (sem `acumulado` / segundo `YAxis`).
4. Top livros: `slice(0, 5)` apenas no bar chart.

- [ ] **Step 2: Apagar `DashboardWelcomeBanner.tsx`**

Confirmar com grep que não há outros imports; depois deletar o arquivo.

- [ ] **Step 3: Typecheck**

```powershell
cd frontend-admin ; npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 4: Commit**

```powershell
git add frontend-admin/src/ui/pages/DashboardPage.tsx
git add -u frontend-admin/src/ui/components/dashboard/DashboardWelcomeBanner.tsx
git commit -m "feat(admin): dashboard enxuto (3 KPIs + tendencia + alertas)"
```

---

### Task 3: Verificação final + spec

- [ ] **Step 1: Checklist manual / grep**

```powershell
cd frontend-admin ; npx tsc --noEmit
rg "DashboardWelcomeBanner|downloadCsv|topCommenters|recentActivities|booksByCategory|exportTop" frontend-admin/src/ui/pages/DashboardPage.tsx
```

Expected: tsc 0; nenhum match dos termos removidos.

- [ ] **Step 2: Atualizar status no spec**

Em `docs/superpowers/specs/2026-08-06-dashboard-enxuto-design.md`:
- Status → `implementado`
- Marcar critérios de pronto com `[x]`

```powershell
git add docs/superpowers/specs/2026-08-06-dashboard-enxuto-design.md
git commit -m "docs(spec): marcar dashboard enxuto como implementado"
```

---

## Spec coverage (self-review)

| Requisito | Task |
|-----------|------|
| 3 KPIs (livros, users, comentários) | 2 |
| Layout C (tendência 8/12 + top 4/12) | 2 |
| Faixa alertas inativos / sem categoria | 1 + 2 |
| Remover welcome, pie, CSV, comentários 2×, tabelas, atividade | 2 |
| Período 7/30/90 | 2 |
| Sem backend | — |
| tsc | 2 + 3 |

**Placeholders:** nenhum. Top livros = barra (uma superfície), não lista+tabela.
