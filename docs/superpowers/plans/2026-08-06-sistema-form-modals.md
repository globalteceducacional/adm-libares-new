# Sistema FormModals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar cadastros inline (`BerryFormPanel`) de Escolas, Equipe e Perfis por FormModal no padrão Acervos/Categorias.

**Architecture:** Extrair `*Form.tsx` + `*FormModal.tsx`; páginas só listam e orquestram estado/`useAdminMutation`. CTA **Novo** no `PageHeroStrip.actions`; Editar abre modal. Sem DetailModal. Equipe: modal só create.

**Tech Stack:** React 18, Vite, TypeScript, `frontend-admin` (`Modal`, `PermissionGate`, Framer Motion).

**Spec:** `docs/superpowers/specs/2026-08-06-sistema-form-modals-design.md`

**Referência de padrão:** `AcervosPage` + `AcervoFormModal` + `AcervosForm` (`inModal`).

**Verificação (sem testes unitários no front):** após cada task, `cd frontend-admin ; npx tsc --noEmit`.

---

## File map

| Ação | Path |
|------|------|
| Create | `frontend-admin/src/ui/components/schools/SchoolsForm.tsx` |
| Create | `frontend-admin/src/ui/components/schools/SchoolFormModal.tsx` |
| Modify | `frontend-admin/src/ui/pages/SchoolsPage.tsx` |
| Modify | `frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx` (prop `inModal`) |
| Create | `frontend-admin/src/ui/components/team/TeamFormModal.tsx` |
| Modify | `frontend-admin/src/ui/pages/TeamPage.tsx` |
| Create | `frontend-admin/src/ui/components/roles/RolesForm.tsx` |
| Create | `frontend-admin/src/ui/components/roles/RoleFormModal.tsx` |
| Modify | `frontend-admin/src/ui/pages/RolesPage.tsx` |

---

### Task 1: Escolas — Form + FormModal + page

**Files:**
- Create: `frontend-admin/src/ui/components/schools/SchoolsForm.tsx`
- Create: `frontend-admin/src/ui/components/schools/SchoolFormModal.tsx`
- Modify: `frontend-admin/src/ui/pages/SchoolsPage.tsx`

- [ ] **Step 1: Criar `SchoolsForm.tsx`**

Extrair o formulário atual do `BerryFormPanel` (nome, slug, status) para o padrão `book-form modern` + `inModal` (botão secundário “Cancelar” vs “Limpar”).

```tsx
import type { FormEvent } from "react";
import { useId } from "react";
import { motion } from "framer-motion";
import type { UpsertSchoolRequest } from "../../../types/schools";

type SchoolsFormProps = {
  form: UpsertSchoolRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertSchoolRequest) => void;
};

export function SchoolsForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  inModal = false,
  onSubmit,
  onReset,
  onChange
}: SchoolsFormProps) {
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const slugId = useId();
  const statusId = useId();

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <label className="form-field" htmlFor={nameId}>
        <span>Nome</span>
        <input
          id={nameId}
          type="text"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          required
          aria-invalid={isNameInvalid || undefined}
          aria-describedby={isNameInvalid ? nameErrorId : undefined}
        />
        {isNameInvalid ? (
          <small id={nameErrorId} role="alert" className="warning-text">
            Informe um nome valido.
          </small>
        ) : null}
      </label>
      <label className="form-field" htmlFor={slugId}>
        <span>Slug</span>
        <input
          id={slugId}
          type="text"
          value={form.slug ?? ""}
          onChange={(event) => onChange({ ...form, slug: event.target.value })}
        />
        <small className="hint-text">Opcional — gerado automaticamente se vazio</small>
      </label>
      <label className="form-field" htmlFor={statusId}>
        <span>Status</span>
        <select
          id={statusId}
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
        >
          <option value="1">Ativa</option>
          <option value="0">Inativa</option>
        </select>
      </label>
      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving}
        >
          {saving ? "Salvando..." : editingId ? "Salvar escola" : "Criar escola"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Criar `SchoolFormModal.tsx`**

Espelhar `AcervoFormModal` (size `lg` / `max-w-2xl`).

```tsx
import type { FormEvent } from "react";
import type { UpsertSchoolRequest } from "../../../types/schools";
import { Modal } from "../../../shared/ui";
import { SchoolsForm } from "./SchoolsForm";

type SchoolFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertSchoolRequest;
  isNameInvalid: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertSchoolRequest) => void;
};

export function SchoolFormModal({
  open,
  editingId,
  form,
  isNameInvalid,
  saving,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange
}: SchoolFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar escola" : "Nova escola"}
      description={
        editingId
          ? `Atualize os dados da escola #${editingId}.`
          : "Defina nome, slug e status para isolar dados por tenant."
      }
      size="lg"
      className="max-w-2xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <SchoolsForm
          form={form}
          editingId={editingId}
          saving={saving}
          isNameInvalid={isNameInvalid}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Refatorar `SchoolsPage.tsx`**

Mudanças obrigatórias (manter mutations/activate/delete/filtros):

1. Remover imports de `BerryFormPanel`, `BerrySelect`, `Field`, `Input` (se não usados).
2. Importar `Plus` de `lucide-react`, `SchoolFormModal`, `Button` permanece.
3. Estado: `const [formModalOpen, setFormModalOpen] = useState(false)`.
4. `isNameInvalid` só exibido quando `showValidation` (passar `showValidation && isNameInvalid` ao form/modal).
5. Funções:

```tsx
function resetForm() {
  setForm(EMPTY_SCHOOL_FORM);
  setEditingId(null);
  setShowValidation(false);
}

function closeFormModal() {
  resetForm();
  setFormError("");
  setFormModalOpen(false);
}

function openCreateForm() {
  resetForm();
  setFormError("");
  setFormModalOpen(true);
}

function handleEdit(school: SchoolResponse) {
  setEditingId(school.id);
  setShowValidation(false);
  setFormError("");
  setForm({
    name: decodeHtmlEntities(school.name),
    slug: school.slug,
    status: school.status
  });
  setFormModalOpen(true);
}
```

6. `saveMutation.onSuccess`: sempre `closeFormModal()` (create e update) — alinhado ao spec.
7. `deleteMutation.onSuccess`: se `editingId === schoolId`, chamar `closeFormModal()` (não só `resetForm`).
8. `PageHeroStrip` com `actions`:

```tsx
actions={
  canCreate ? (
    <PermissionGate anyOf={["schools.create"]}>
      <Button type="button" onClick={openCreateForm} disabled={saving}>
        <Plus size={16} />
        Nova escola
      </Button>
    </PermissionGate>
  ) : null
}
```

9. Remover o bloco `PermissionGate` + `BerryFormPanel` inteiro.
10. Após hero/stats, alert de erro só fora do modal:

```tsx
{formError && !formModalOpen ? (
  <Alert tone="danger" className="mb-3">
    {formError}
  </Alert>
) : null}
```

11. Antes do `ConfirmDialog`, renderizar:

```tsx
<SchoolFormModal
  open={formModalOpen}
  editingId={editingId}
  form={form}
  isNameInvalid={showValidation && isNameInvalid}
  saving={saving}
  error={formError}
  onClose={closeFormModal}
  onSubmit={handleSubmit}
  onReset={closeFormModal}
  onFormChange={setForm}
/>
```

12. Remover `scrollIntoView` de `handleEdit`.

- [ ] **Step 4: Typecheck**

Run: `cd frontend-admin ; npx tsc --noEmit`  
Expected: exit 0

- [ ] **Step 5: Commit**

```powershell
git add frontend-admin/src/ui/components/schools/SchoolsForm.tsx frontend-admin/src/ui/components/schools/SchoolFormModal.tsx frontend-admin/src/ui/pages/SchoolsPage.tsx
git commit -m "feat(admin): FormModal no cadastro de Escolas"
```

---

### Task 2: Equipe — `inModal` + TeamFormModal + page

**Files:**
- Modify: `frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx`
- Create: `frontend-admin/src/ui/components/team/TeamFormModal.tsx`
- Modify: `frontend-admin/src/ui/pages/TeamPage.tsx`

- [ ] **Step 1: Adicionar `inModal` em `CreateTeamMemberForm`**

Na props:

```tsx
inModal?: boolean;
```

Default `false`. No botão secundário:

```tsx
{inModal ? "Cancelar" : "Limpar formulario"}
```

Quando `inModal`, `onReset` será `closeFormModal` (fecha + limpa).

- [ ] **Step 2: Criar `TeamFormModal.tsx`**

```tsx
import type { FormEvent } from "react";
import type { SchoolResponse } from "../../../types/schools";
import { Modal } from "../../../shared/ui";
import {
  CreateTeamMemberForm,
  type CreateTeamMemberFormState
} from "./CreateTeamMemberForm";

type TeamFormModalProps = {
  open: boolean;
  form: CreateTeamMemberFormState;
  saving: boolean;
  isSuperAdmin: boolean;
  needsSchoolContext: boolean;
  isFormInvalid: boolean;
  schoolOptions: SchoolResponse[];
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: CreateTeamMemberFormState) => void;
};

export function TeamFormModal({
  open,
  form,
  saving,
  isSuperAdmin,
  needsSchoolContext,
  isFormInvalid,
  schoolOptions,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange
}: TeamFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo membro da equipe"
      description="Crie contas de admin da escola ou professor para acesso ao painel."
      size="lg"
      className="max-w-2xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <CreateTeamMemberForm
          form={form}
          saving={saving}
          isSuperAdmin={isSuperAdmin}
          needsSchoolContext={needsSchoolContext}
          isFormInvalid={isFormInvalid}
          schoolOptions={schoolOptions}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Refatorar `TeamPage.tsx`**

1. Remover `BerryFormPanel` / `UserPlus` do painel (manter `UserCog` no hero; importar `Plus` + `Button`).
2. `const [formModalOpen, setFormModalOpen] = useState(false)`.
3. Funções:

```tsx
function resetCreateForm() {
  setCreateForm(buildInitialTeamMemberForm(isSuperAdmin, defaultSchoolId));
  setShowValidation(false);
}

function closeFormModal() {
  resetCreateForm();
  setFormError("");
  setFormModalOpen(false);
}

function openCreateForm() {
  if (needsSchoolContext) {
    return;
  }
  resetCreateForm();
  setFormError("");
  setFormModalOpen(true);
}
```

4. `createMutation.onSuccess`: `closeFormModal()`.
5. Hero `actions`:

```tsx
actions={
  canCreate ? (
    <PermissionGate permission="team.create">
      <Button
        type="button"
        onClick={openCreateForm}
        disabled={saving || needsSchoolContext}
        title={
          needsSchoolContext
            ? "Selecione uma escola no topo do painel"
            : undefined
        }
      >
        <Plus size={16} />
        Novo membro
      </Button>
    </PermissionGate>
  ) : null
}
```

6. Remover `BerryFormPanel` + form inline; manter Alert de `needsSchoolContext`.
7. Alert `formError && !formModalOpen`.
8. Render `TeamFormModal` com props ligadas ao estado atual; `isFormInvalid={showValidation && isCreateFormInvalid}`; `onReset={closeFormModal}`.

- [ ] **Step 4: Typecheck**

Run: `cd frontend-admin ; npx tsc --noEmit`  
Expected: exit 0

- [ ] **Step 5: Commit**

```powershell
git add frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx frontend-admin/src/ui/components/team/TeamFormModal.tsx frontend-admin/src/ui/pages/TeamPage.tsx
git commit -m "feat(admin): FormModal no cadastro de Equipe"
```

---

### Task 3: Perfis — RolesForm + RoleFormModal + page

**Files:**
- Create: `frontend-admin/src/ui/components/roles/RolesForm.tsx`
- Create: `frontend-admin/src/ui/components/roles/RoleFormModal.tsx`
- Modify: `frontend-admin/src/ui/pages/RolesPage.tsx`

- [ ] **Step 1: Criar `RolesForm.tsx`**

Extrair o form do painel (nome, status, `SearchableCheckboxList`, ações). Props:

```tsx
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { UpsertRoleRequest } from "../../../types/roles";
import { BerrySelect } from "../layout/BerrySelect";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";
import { Field, Input } from "../../../shared/ui";

type PermissionItem = {
  id: string;
  label: string;
  description: string;
};

type RolesFormProps = {
  form: UpsertRoleRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  isPermissionsInvalid: boolean;
  isEditingSystemRole: boolean;
  needsSchoolContext: boolean;
  canSubmit: boolean;
  permissionItems: PermissionItem[];
  canManageRoles: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertRoleRequest) => void;
  onTogglePermission: (code: string) => void;
};

export function RolesForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  isPermissionsInvalid,
  isEditingSystemRole,
  needsSchoolContext,
  canSubmit,
  permissionItems,
  canManageRoles,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onTogglePermission
}: RolesFormProps) {
  const fieldsDisabled = isEditingSystemRole || needsSchoolContext;

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nome"
          required
          error={isNameInvalid ? "Informe um nome valido." : undefined}
        >
          <Input
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            disabled={fieldsDisabled}
            required
            invalid={isNameInvalid}
          />
        </Field>
        <BerrySelect
          label="Status"
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={fieldsDisabled}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </BerrySelect>
      </div>

      <fieldset className="form-field acervo-fieldset">
        <legend>Permissoes</legend>
        <SearchableCheckboxList
          items={permissionItems}
          selectedIds={form.permissionCodes}
          onToggle={onTogglePermission}
          searchPlaceholder="Buscar permissao por codigo ou modulo..."
          tall
          disabled={fieldsDisabled || !canManageRoles}
          emptyMessage="Nenhuma permissao disponivel."
        />
        {isPermissionsInvalid ? (
          <small className="warning-text">Selecione ao menos uma permissao.</small>
        ) : null}
      </fieldset>

      <div className="book-form-actions">
        {canSubmit ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="primary-btn"
            type="submit"
            disabled={saving || needsSchoolContext}
          >
            {saving ? "Salvando..." : editingId ? "Salvar perfil" : "Criar perfil"}
          </motion.button>
        ) : null}
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal
            ? isEditingSystemRole
              ? "Fechar"
              : "Cancelar"
            : isEditingSystemRole
              ? "Fechar"
              : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
```

`canSubmit` na page: `!isEditingSystemRole && (editingId ? canUpdate : canCreate)`.

- [ ] **Step 2: Criar `RoleFormModal.tsx`**

```tsx
import type { FormEvent } from "react";
import type { UpsertRoleRequest } from "../../../types/roles";
import { Modal } from "../../../shared/ui";
import { RolesForm } from "./RolesForm";

type PermissionItem = {
  id: string;
  label: string;
  description: string;
};

type RoleFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertRoleRequest;
  isNameInvalid: boolean;
  isPermissionsInvalid: boolean;
  isEditingSystemRole: boolean;
  needsSchoolContext: boolean;
  canSubmit: boolean;
  canManageRoles: boolean;
  permissionItems: PermissionItem[];
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertRoleRequest) => void;
  onTogglePermission: (code: string) => void;
};

export function RoleFormModal(props: RoleFormModalProps) {
  const {
    open,
    editingId,
    isEditingSystemRole,
    saving,
    error,
    onClose,
    onSubmit,
    onReset,
    onFormChange,
    onTogglePermission,
    ...formProps
  } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditingSystemRole
          ? "Perfil de sistema (somente leitura)"
          : editingId
            ? "Editar perfil"
            : "Novo perfil"
      }
      description="Combine permissoes por modulo para controlar o acesso dos usuarios."
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body">
        <RolesForm
          editingId={editingId}
          isEditingSystemRole={isEditingSystemRole}
          saving={saving}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onTogglePermission={onTogglePermission}
          {...formProps}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Refatorar `RolesPage.tsx`**

1. Remover `BerryFormPanel` inline; importar `Plus`, `RoleFormModal`, `Button`.
2. `formModalOpen` + `closeFormModal` / `openCreateForm` / `handleEdit` abre modal (sem scroll).
3. `saveMutation.onSuccess` → `closeFormModal()`.
4. `deleteMutation` se editing → `closeFormModal()`.
5. Hero actions **Nova perfil** com `roles.create` (só create no botão; update via Editar).
6. Sistema: botão “Ver” continua abrindo modal read-only (`isEditingSystemRole`).
7. Alert `needsSchoolContext` permanece; `formError && !formModalOpen`.
8. Montar `RoleFormModal` com `isNameInvalid={showValidation && isNameInvalid}`, etc.

- [ ] **Step 4: Typecheck**

Run: `cd frontend-admin ; npx tsc --noEmit`  
Expected: exit 0

- [ ] **Step 5: Commit**

```powershell
git add frontend-admin/src/ui/components/roles/RolesForm.tsx frontend-admin/src/ui/components/roles/RoleFormModal.tsx frontend-admin/src/ui/pages/RolesPage.tsx
git commit -m "feat(admin): FormModal no cadastro de Perfis"
```

---

### Task 4: Verificação final + checklist do spec

- [ ] **Step 1: Typecheck limpo**

```powershell
cd frontend-admin ; npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 2: Smoke manual (dev)**

1. `/escolas` — sem painel lateral; Nova escola / Editar abrem modal; save fecha.
2. `/equipe` — Novo membro abre modal; Ativar/Desativar na linha.
3. `/perfis` — Novo / Editar / Ver (sistema) abrem modal; lista full-width.
4. Grep: nenhum `BerryFormPanel` restante nessas três pages.

```powershell
rg "BerryFormPanel" frontend-admin/src/ui/pages/SchoolsPage.tsx frontend-admin/src/ui/pages/TeamPage.tsx frontend-admin/src/ui/pages/RolesPage.tsx
```

Expected: sem matches

- [ ] **Step 3: Atualizar status no spec (opcional)**

Em `docs/superpowers/specs/2026-08-06-sistema-form-modals-design.md`, marcar critérios de pronto e status `implementado`.

---

## Spec coverage (self-review)

| Requisito do spec | Task |
|-------------------|------|
| Remover BerryFormPanel Escolas/Equipe/Perfis | 1, 2, 3 |
| CTA Novo | 1, 2, 3 |
| Editar abre modal (Escolas/Perfis) | 1, 3 |
| Equipe só create no modal | 2 |
| Sucesso fecha modal | 1–3 `closeFormModal` em onSuccess |
| Sem DetailModal / Auditoria / Users | não incluídos |
| tsc | Steps 4 de cada task + Task 4 |

**Placeholders:** nenhum TBD.  
**Tipos:** `UpsertSchoolRequest`, `CreateTeamMemberFormState`, `UpsertRoleRequest` alinhados aos types existentes.
