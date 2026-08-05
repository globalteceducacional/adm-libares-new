# Fase 4 — Front admin UX (detalhe Site* + Team polish)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Paridade de modal de detalhe nas entidades Site/Seções e alinhar Equipe ao padrão Toast/validação.

**Architecture:** Espelhar `AuthorDetailModal` / `CategoryDetailModal` / padrão de seções. Team ainda sem API de toggle — só polish de UX (toast + validação pós-submit). Toggle de Team fica backlog backend.

**Tech Stack:** React + Vite (`frontend-admin`).

---

## Escopo

**Inclui**
1. Detail modals: Site Autores, Site Categorias, Seções ebook, Seções Site
2. TeamPage: Toast + `showValidation`

**Fora**
- Endpoint toggle Team (`PATCH /admin-users/{id}/status`)
- `useCrudListing` / `useMutation`

---

### Task 1: Team polish

- [x] Toast; remover useTimedMessage success
- [x] showValidation no create form

### Task 2: Site Author / Category detail

- [x] `SiteAuthorDetailModal` + `onRowClick`
- [x] `SiteCategoryDetailModal` + `onRowClick`

### Task 3: Section detail

- [x] `HomeSectionDetailModal` + `SiteSectionDetailModal`
- [x] Wire páginas

### Task 4: Verificação

- [x] `npx tsc --noEmit`
- [ ] Smoke manual
