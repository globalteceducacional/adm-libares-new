# Dashboard enxuto — redesign

**Data:** 2026-08-06  
**Status:** aprovado em conversa; aguardando revisão do arquivo  
**Escopo:** `frontend-admin` — página `/dashboard` (somente UI; API existente)

## Problema

O dashboard atual (~600 linhas) empilha welcome, 4 KPIs, 3 mini-cards, 4 gráficos (comentários duplicados), tabela de livros (duplicando gráfico), top comentaristas + CSV e atividade recente. Pouca hierarquia; dados importantes competem com ruído.

## Decisões de produto

- **Objetivo:** misto enxuto — saúde + 1 tendência + 1 lista de atenção.
- **Layout:** C — 3 KPIs; tendência + top livros lado a lado; faixa de alertas embaixo.
- **KPIs:** Livros ativos · Usuários ativos · Comentários no período.
- **Implementação:** só frontend (abordagem A). Sem novos endpoints.

## Layout (primeira dobra)

```
[ PageShell: Dashboard + seletor 7d | 30d | 90d ]

[ KPI ] [ KPI ] [ KPI ]     ← 3 colunas

[ Tendência comentários/dia  |  Top 5 livros ]
[          ~2/3              |     ~1/3      ]

[ Faixa alertas: inativos | sem categoria | … ]
```

## Conteúdo

### Manter / incluir

| Bloco | Fonte API (`DashboardSummary`) | Notas |
|-------|--------------------------------|-------|
| Período 7/30/90 | query `periodDays` | URL + localStorage como hoje |
| Livros ativos | `totals.activeBooks` | Hint: N em destaque (`featuredBooks`); link `/livros?status=1` |
| Usuários ativos | `totals.activeUsers` | Hint: atividade 30d (`activeUsersLast30Days`); link `/usuarios?status=1` |
| Comentários no período | `totals.commentsLast7Days` + série | Apesar do nome do campo, o backend conta no `periodDays` selecionado; delta vs `commentsPrevious7Days`; link `/comentarios` |
| Gráfico tendência | `commentsByDay` | Um gráfico área/linha simples — **sem** eixo de acumulado nem segundo gráfico |
| Top 5 livros | `topBooks` (slice 0..5) | Uma superfície (lista compacta **ou** barra curta — não ambos) |
| Faixa alertas | `inactiveBooks`, `booksWithoutCategory` | Cards/chips clicáveis para listagens filtradas quando houver rota/filtro útil |

### Remover

- `DashboardWelcomeBanner`
- KPI Visualizações e média por livro
- Grid de 3 secondary stats soltos (valores migram para a faixa de alertas)
- Pizza livros por categoria
- Segundo gráfico de comentários (linha “comparativo diário”)
- Tabela “Livros mais acessados” (duplicata do top)
- Top comentaristas + export CSV
- Lista “Atividade recente”
- Lógica `downloadCsv` / toast de export (se não restar export)

## Técnico

- **Arquivo principal:** `frontend-admin/src/ui/pages/DashboardPage.tsx` — reduzir e reorganizar.
- **Reusar:** `DashboardStatCard`, `DashboardChartCard`, tema `chartTheme`, `useDashboardQuery`.
- **Opcional:** extrair faixa de alertas para `DashboardAlertStrip.tsx` se o JSX da page ainda ficar denso.
- **Sem:** mudanças em `backend`, tipos além de limpeza de imports não usados, DetailModal, novos widgets genéricos.
- **Verificação:** `npx tsc --noEmit` em `frontend-admin`.

## Critérios de pronto

- [ ] Dashboard mostra no máximo: 3 KPIs + 1 gráfico de tendência + 1 top livros + faixa de alertas
- [ ] Nenhum gráfico/tabela duplicado (comentários ou livros)
- [ ] Welcome, CSV, top comentaristas e atividade recente removidos
- [ ] Seletor de período continua funcional
- [ ] `tsc --noEmit` passa

## Fora de escopo

- Novos indicadores de API (ex.: comentários pendentes de moderação)
- Redesign global do `PageShell` / tema Berry
- Mobile-first redesign além do grid responsivo já usado
