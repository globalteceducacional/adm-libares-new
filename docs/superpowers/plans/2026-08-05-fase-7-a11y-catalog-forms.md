# Fase 7 — A11y formulários do catálogo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Associar labels/erros a controles com `aria-invalid` / `aria-describedby` no catálogo ebook/Site, sem migrar visual para Berry `Field`.

**Architecture:** Manter markup `form-field`; injetar ids + ARIA. `Input.invalid` → `aria-invalid`. Searchable* aceitam `invalid`.

**Tech Stack:** React `frontend-admin`.

---

### Task 1: Primitivos

- [x] `Input`: `aria-invalid` a partir de `invalid`
- [x] `SearchableSelect` / `SearchableCheckboxList`: prop `invalid`

### Task 2: Forms simples

- [x] Categories, Authors, Acervos, SiteAuthors, SiteCategories, HomeSections, SiteSections

### Task 3: Books + Sites

- [x] Campos com validação + Searchable*

### Task 4: Verificação

- [x] `npx tsc --noEmit`
