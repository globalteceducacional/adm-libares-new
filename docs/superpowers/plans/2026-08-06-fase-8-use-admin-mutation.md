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

### Task 3: Verificação

- [x] `npx tsc --noEmit`
