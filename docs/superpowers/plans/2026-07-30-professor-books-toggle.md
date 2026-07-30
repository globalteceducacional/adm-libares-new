# PROFESSOR books toggle — Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Role PROFESSOR scoped to school can list school books and PATCH status only; seed `teste.professor`.

**Architecture:** Permission `books.toggle_status`; role PROFESSOR per school; acervo→school only; existing tenant filter on list; new PATCH endpoint; UI toggle without full edit.

**Tech Stack:** Kotlin/Spring, Flyway Java migration, React admin

---

### Task 1: Migration + provision PROFESSOR
### Task 2: ToggleBookStatusUseCase + API
### Task 3: Frontend nav + BooksPage toggle
### Task 4: Deploy notes / verify locally if possible
