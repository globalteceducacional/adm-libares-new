# Fase 6 — Detail modal Comentários do Site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Paridade de modal de detalhe em Comentários do Site com Comentários ebook.

**Architecture:** Espelhar `CommentDetailModal`, sem toggle de status (API Site só lista/exclui). Clique na linha abre detalhe; Excluir no modal reusa `ConfirmDialog`.

**Tech Stack:** React `frontend-admin`.

---

### Task 1: Modal

- [x] Criar `SiteCommentDetailModal.tsx` (ID, Site, Usuário, Email, Data, texto; Fechar + Excluir se `canModerate`)

### Task 2: Página

- [x] `selectedComment` + sync `useEffect`
- [x] `onRowClick` + card mobile
- [x] Wire modal + limpar seleção ao excluir

### Task 3: Verificação

- [x] `npx tsc --noEmit`
