# Fase 8 — useAdminMutation + piloto Categories/Acervos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir boilerplate de mutações (toast + invalidate + isPending) sem reescrever todas as páginas de uma vez.

**Architecture:** `useAdminMutation` (React Query `useMutation` + toast) e `useSelectedEntity` (sync detail). Piloto: CategoriesPage + AcervosPage.

**Tech Stack:** React Query 5, `frontend-admin`.

---

### Task 1: Hooks

- [x] `useAdminMutation.ts`
- [x] `useSelectedEntity.ts`

### Task 2: Piloto

- [x] Refatorar `CategoriesPage` (save / activate / delete)
- [x] Refatorar `AcervosPage` (save / activate / delete)

### Task 2b: Authors / SiteAuthors / SiteCategories

- [x] Refatorar `AuthorsPage` (save / activate / delete)
- [x] Refatorar `SiteAuthorsPage` (save / activate / delete)
- [x] Refatorar `SiteCategoriesPage` (save / activate / delete)

### Task 2c: HomeSections / SiteSections / Schools

- [x] Refatorar `HomeSectionsPage` (save / activate / delete + `useSelectedEntity`)
- [x] Refatorar `SiteSectionsPage` (save / activate / delete + `useSelectedEntity`)
- [x] Refatorar `SchoolsPage` (save / activate / delete; sem `useSelectedEntity`; create reseta form, update mantém edição)

### Task 2d: Roles / Comments / Team

- [x] Refatorar `RolesPage` (save / activate / delete; sem `useSelectedEntity`; create e update resetam form)
- [x] Refatorar `CommentsPage` (toggleStatus / delete + `useSelectedEntity`)
- [x] Refatorar `TeamPage` (create / toggle; sem `useSelectedEntity`)

### Task 3: Verificação

- [x] `npx tsc --noEmit`
