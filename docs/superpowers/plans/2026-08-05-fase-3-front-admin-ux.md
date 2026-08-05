# Fase 3 — Front admin UX (listagens e Sites)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir churn na URL de busca, alinhar Comments ao shell Berry e dar paridade de detalhe aos Sites.

**Architecture:** Debounce só na escrita da query string (`q`); UI continua imediata. Comments/SiteComments passam a `ListingPageShell` + hero/stats + Toast. `SiteDetailModal` espelha `BookDetailModal`.

**Tech Stack:** React + Vite (`frontend-admin`), `useAdminListFilters`, `ListingPageShell`, `useToast`.

---

## Escopo

**Inclui**
1. Debounce (~300ms) em `useAdminListFilters` para `q`
2. `CommentsPage` + `SiteCommentsPage` → ListingPageShell + Toast
3. `SiteDetailModal` + clique na linha em `SitesPage`

**Fora**
- `useCrudListing` / `useMutation`
- Search server-side
- Team edit completo

---

### Task 1: Debounce da busca

**Files:**
- Modify: `frontend-admin/src/hooks/useAdminListFilters.ts`

- [x] Debounce update de `q` na URL; estado local imediato
- [x] Status continua síncrono

### Task 2: Comments no shell Berry

**Files:**
- Modify: `frontend-admin/src/ui/pages/CommentsPage.tsx`
- Modify: `frontend-admin/src/ui/pages/SiteCommentsPage.tsx`

- [x] ListingPageShell + PageHeroStrip + ListingMiniStats
- [x] Toast no lugar de useTimedMessage

### Task 3: SiteDetailModal

**Files:**
- Create: `frontend-admin/src/ui/components/sites/SiteDetailModal.tsx`
- Modify: `frontend-admin/src/ui/pages/SitesPage.tsx`

- [x] Modal detalhe (capa, autor, categorias, status, ações)
- [x] onRowClick abre detalhe; Editar/Ativar-Desativar/Excluir

### Task 4: Verificação

- [x] `npx tsc --noEmit`
- [ ] Smoke manual
