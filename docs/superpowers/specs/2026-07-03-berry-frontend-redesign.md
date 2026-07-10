# Redesign frontend — inspiracao Berry (2026-07-03)

## Objetivo

Modernizar o painel admin com visual proximo ao [Berry Free React Template](https://github.com/codedthemes/berry-free-react-admin-template): cards limpos, roxo Material (#673ab7), sidebar clara, dashboard com graficos ricos e layout responsivo.

## Escopo fase 1 (implementado)

- Design tokens Berry (primary, sombras, sidebar)
- Fonte Poppins para titulos (`font-display`)
- Shell: Topbar com avatar/nome, Sidebar rebranded
- Dashboard reformulado:
  - Banner de boas-vindas
  - 4 KPIs principais + 3 secundarios
  - Area chart (comentarios + acumulado)
  - Donut chart (livros por categoria)
  - Line chart (tendencia diaria)
  - Bar chart horizontal (top livros)
  - Tabelas e atividade recente
- Login alinhado a paleta Berry

## Escopo fase 2 (pendente)

- Unificar paginas de listagem (Livros, Usuarios, Acervos) com cards Berry
- Componente `PageToolbar` padrao (filtros + acoes)
- Mobile: bottom nav opcional
- Dark mode refinado Berry

## Stack

Mantido Vite + React + Tailwind + Recharts (sem migrar para MUI do Berry original).

## Referencia Berry

| Elemento Berry | Adaptacao Libare |
|----------------|------------------|
| Purple primary | `#673ab7` |
| Stat cards com icone | `DashboardStatCard` |
| Area/Donut charts | Recharts Area + Pie |
| Welcome banner | `DashboardWelcomeBanner` |
| Light sidebar | tokens `--sidebar-*` |
