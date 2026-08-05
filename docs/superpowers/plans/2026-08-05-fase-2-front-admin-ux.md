# Fase 2 — Front admin UX (catálogo)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Padronizar Ativar/Desativar, validação pós-submit e feedback Toast no painel admin, sem refatorar a arquitetura inteira.

**Architecture:** Reaproveitar o padrão já usado em Livros/Sites/Categorias (botão Ativar na linha + modal; `showValidation` só após submit; Toast como feedback principal). Sem novos endpoints nesta fase — reativar via `PUT` reenviando campos existentes, como já feito em Categorias/Autores.

**Tech Stack:** React + Vite (`frontend-admin`), `useToast`, `SearchableSelect`/`SearchableCheckboxList`, páginas em `src/ui/pages/*`.

---

## Escopo desta fase

**Inclui**
1. Validação de campos só após tentativa de salvar (catálogo ebook + Site + Roles).
2. Botão **Ativar** onde ainda falta (Roles, Schools; detail/row do Site* se incompleto).
3. Preferir Toast; remover Alert de sucesso duplicado nas páginas tocadas.

**Fora desta fase** (backlog)
- Hook genérico `useCrudListing`
- Detail modal de Sites
- Debounce de busca / search server-side
- `useMutation` React Query
- Comments → ListingPageShell

---

## Já feito (não refazer)

- Modais CRUD catálogo (Fase 1)
- `SearchableCheckboxList` + `SearchableSelect`
- Ativar em Categories/Authors/Acervos/HomeSections/SiteAuthors/SiteCategories/SiteSections (linha)
- Validação pós-submit em Books + Sites
- Detail Ativar em Category/Author/Acervo

---

### Task 1: Validação pós-submit no catálogo restante

**Files:**
- Modify: `frontend-admin/src/ui/pages/AuthorsPage.tsx`
- Modify: `frontend-admin/src/ui/pages/CategoriesPage.tsx`
- Modify: `frontend-admin/src/ui/pages/AcervosPage.tsx`
- Modify: `frontend-admin/src/ui/pages/HomeSectionsPage.tsx`
- Modify: `frontend-admin/src/ui/pages/SiteAuthorsPage.tsx`
- Modify: `frontend-admin/src/ui/pages/SiteCategoriesPage.tsx`
- Modify: `frontend-admin/src/ui/pages/SiteSectionsPage.tsx`
- Modify: `frontend-admin/src/ui/pages/RolesPage.tsx`
- Modify: form/modals que recebem flags `is*Invalid` (passar `showValidation && flag`)

- [x] **Step 1:** Em cada página, adicionar `const [showValidation, setShowValidation] = useState(false)`
- [x] **Step 2:** Resetar em `resetForm` / `openCreate` / `handleEdit` / `closeFormModal`
- [x] **Step 3:** Em `handleSubmit`, `setShowValidation(true)`; se inválido, setar erro e `return` (não chamar API)
- [x] **Step 4:** Passar `showValidation && isXInvalid` para o form/modal; não desabilitar submit só por form inválido
- [ ] **Step 5:** Smoke: abrir “Novo” → sem vermelho; salvar vazio → vermelho + toast/erro

---

### Task 2: Ativar em Roles e Schools

**Files:**
- Modify: `frontend-admin/src/ui/pages/RolesPage.tsx`
- Modify: `frontend-admin/src/ui/pages/SchoolsPage.tsx`
- Modify: services se update já aceita `status: "1"` (reusar PUT)

- [x] **Step 1:** Confirmar que `updateRole` / `updateSchool` aceitam status `"1"`
- [x] **Step 2:** `handleActivate` reenviando campos da API + `status: "1"`
- [x] **Step 3:** Na tabela: Ativar se inativo; Desativar se ativo (mesmo padrão Categorias)
- [ ] **Step 4:** Smoke: desativar → filtrar Inativos → Ativar → some da lista inativos

---

### Task 3: Feedback Toast unificado (páginas da Fase 2)

**Files:** mesmas páginas das Tasks 1–2 + Books/Sites se ainda duplicarem

- [x] **Step 1:** Em sucesso de create/update/activate/delete: só `showToast(...)`
- [x] **Step 2:** Remover `showSuccess` / prop `success` da listagem nessas páginas (ou deixar só erro de query)
- [ ] **Step 3:** Smoke: salvar → um toast, sem faixa verde duplicada na lista

---

### Task 4: Verificação

- [x] **Step 1:** `npx tsc --noEmit` em `frontend-admin`
- [x] **Step 2:** Conferir lint dos arquivos tocados
- [ ] **Step 3:** Checklist manual: Livro, Categoria, Autor Site, Role, Escola

---

## Ordem de execução

1 → 2 → 3 → 4 (commits opcionais por task se o usuário pedir)
