# Fase 1 — Form system canônico + Users/Team

> **For agentic workers:** Use superpowers:executing-plans. Checkboxes abaixo.

**Goal:** Introduzir `Select` / `FormGrid` / `FormActions` em `shared/ui` e migrar Users + Team (ADR 0003 / 0004).

**Architecture:** Forms de domínio usam Field+Input+Select+Button; SearchableSelect permanece para listas longas; BerrySelect vira wrapper fino do Select para filtros.

**Tech Stack:** React 18, Tailwind 3.4, shared/ui

**Commits:** manuais pelo usuário.

---

### Task 1: shared/ui Form primitives ✅

- Create: `frontend-admin/src/shared/ui/Form.tsx`
- Modify: `frontend-admin/src/shared/ui/index.ts`, `Feedback.tsx` (className no Field), `SearchableSelect.tsx` (aria-invalid)

### Task 2: Migrar UsersForm ✅

- Modify: `frontend-admin/src/ui/components/users/UsersForm.tsx`

### Task 3: Migrar CreateTeamMemberForm ✅

- Modify: `frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx`
- Modify: `frontend-admin/src/ui/components/layout/BerrySelect.tsx` (usa Select)

### Task 4: Verificar

- [x] `npx tsc -b` (rodar na execução)
- [ ] Commit manual:

```powershell
git add frontend-admin/src/shared/ui frontend-admin/src/ui/components/users/UsersForm.tsx frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx frontend-admin/src/ui/components/layout/BerrySelect.tsx frontend-admin/src/ui/components/form/SearchableSelect.tsx docs/superpowers
git commit -m "feat(admin): FormGrid/Select canonicos e migrar Users/Team (Fase 1)"
```
