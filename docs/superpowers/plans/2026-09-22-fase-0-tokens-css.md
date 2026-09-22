# Fase 0 — Tokens CSS unificados (frontend-admin)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** Eliminar o `:root` duplicado em `styles.css` e corrigir variáveis fantasma, deixando `index.css` como única fonte de tokens (ADR 0002), sem migrar formulários ainda.

**Architecture:** `main.tsx` já importa `index.css` antes de `styles.css`. Removemos tokens/backgrounds duplicados de `styles.css` e apontamos cores quebradas para `--text` / `--text-muted`. Mantemos o restante do CSS legado intacto (ADR 0005).

**Tech Stack:** React 18, Vite 5, Tailwind 3.4, CSS variables Berry.

**Spec:** [2026-09-22-frontend-css-forms-unification-design.md](../specs/2026-09-22-frontend-css-forms-unification-design.md)  
**ADRs:** 0001, 0002, 0005

**Commits:** o usuário roda git localmente (não auto-commit).

---

## File map

| Arquivo | Responsabilidade |
|---------|------------------|
| `frontend-admin/src/index.css` | Única fonte `:root` / `:root.dark`; base body/html |
| `frontend-admin/src/styles.css` | Legado Berry/book-form — **sem** redefinir tokens |
| `docs/superpowers/specs/2026-09-22-...md` | Marcar Fase 0 como em progresso/feito |

---

### Task 1: Remover tokens duplicados de `styles.css`

**Files:**
- Modify: `frontend-admin/src/styles.css` (topo do arquivo)
- Modify: `frontend-admin/src/index.css` (alinhar `html/body/#root` height)

- [x] **Step 1: Em `index.css`, garantir height full no base layer**
- [x] **Step 2: Remover de `styles.css` os blocos `:root`, `:root.dark`, e os backgrounds de `body`**
- [x] **Step 3: Corrigir variáveis fantasma em `styles.css`**
- [x] **Step 4: Verificar typecheck**
- [x] **Step 5: Atualizar status na spec**
- [ ] **Step 6: Usuário commit (manual)**

---

### Task 2 (próximo plano — NÃO nesta execução)

Fase 1: `FormGrid` / `Select` shared + regra de não usar `primary-btn` em código novo.  
Ver ADR 0003.
