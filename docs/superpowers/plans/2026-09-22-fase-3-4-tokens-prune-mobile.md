# Fase 3 + 4 — Tokens shell, prune CSS, mobile cards

**Status:** implementado (local)

## Fase 3
- Substituído `violet-*` / `indigo-*` por `primary` / tokens em Login, Topbar, Sidebar, PageHeroStrip, DashboardStatCard, BerryFormPanel, Games

## Fase 4
- Removido bloco shell legado de `styles.css` (~3.7k chars): app-shell, sidebar antigo, menu-link, primary-btn, login-card, media 940px
- `renderMobileCard` em SchoolsPage, RolesPage, GamesPage
- SitesPage CTA → `Button` shared

## Commit (manual)

```powershell
git add frontend-admin/src docs/superpowers
git commit -m "feat(admin): tokens primary na shell, prune CSS legado e mobile cards (Fase 3-4)"
```
