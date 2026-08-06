# Auditoria UX Berry — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alinhar `/auditoria` ao padrão Berry (hero + KPIs + tabelas) sem mudar a API.

**Architecture:** Reescrever `AuditPage.tsx` com `ListingPageShell`, `PageHeroStrip`, `ListingMiniStats` e botão Atualizar (`refetch`). Manter as 4 tabelas e estados `ok:false` / erro / loading. Sem backend.

**Tech Stack:** React 18, React Query, `frontend-admin`.

**Spec:** `docs/superpowers/specs/2026-08-06-auditoria-ux-berry-design.md`

**Verificação:** `cd frontend-admin ; npx tsc --noEmit`

---

## File map

| Ação | Path |
|------|------|
| Modify | `frontend-admin/src/ui/pages/AuditPage.tsx` |

Não criar componentes novos salvo se a page passar de ~350 linhas (YAGNI: tudo na page).

---

### Task 1: Reescrever AuditPage no layout Berry A

**Files:**
- Modify: `frontend-admin/src/ui/pages/AuditPage.tsx`

- [ ] **Step 1: Trocar imports e shell**

Remover dependência visual de `page-card` / `books-page-stack` como layout principal. Usar:

```tsx
import { motion } from "framer-motion";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getQueryErrorMessage, useAuditQuery } from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import type {
  AuditActorActivityRow,
  AuditConsistencyRow,
  AuditModuleSummaryRow,
  AuditSoftDeleteRow
} from "../../types/audit";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { DataTable, type DataTableColumn } from "../components/table/DataTable";
import { Alert, Button, Card, CardHeader, Skeleton, TableSkeleton } from "../../shared/ui";
```

Manter `auditReasonMessage` e `formatInstant` como estão (ou mover `formatInstant` para o final do arquivo).

- [ ] **Step 2: KPIs derivados + refetch**

Dentro de `AuditPage`, após obter `auditQuery` / `data`:

```tsx
const listStats = useMemo(() => {
  if (!data?.ok) {
    return [
      { label: "Modulos", value: 0 },
      { label: "Registos totais", value: 0 },
      { label: "Soft-deletes", value: 0 },
      { label: "Exclusoes listadas", value: 0 }
    ];
  }
  const totalRows = data.moduleSummary.reduce((sum, row) => sum + row.totalRows, 0);
  const softDeleted = data.moduleSummary.reduce((sum, row) => sum + row.softDeletedRows, 0);
  return [
    { label: "Modulos", value: data.moduleSummary.length },
    { label: "Registos totais", value: totalRows },
    { label: "Soft-deletes", value: softDeleted },
    { label: "Exclusoes listadas", value: data.recentSoftDeletes.length }
  ];
}, [data]);

const refreshing = auditQuery.isFetching && !auditQuery.isLoading;

const hero = (
  <PageHeroStrip
    icon={ClipboardList}
    title="Auditoria"
    description="Exclusoes logicas recentes, atividade por ator e consistencia dos dados."
    tone="info"
    actions={
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={auditQuery.isLoading || auditQuery.isFetching}
        onClick={() => {
          void auditQuery.refetch();
        }}
      >
        <RefreshCw size={16} className={refreshing ? "animate-spin" : undefined} />
        Atualizar
      </Button>
    }
  />
);
```

Se `animate-spin` não existir no CSS do projeto, omitir a class e manter só o ícone estático.

- [ ] **Step 3: Loading / erro / ok:false com ListingPageShell**

```tsx
if (loading) {
  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={hero}
      stats={<ListingMiniStats items={listStats} />}
    >
      <div className="space-y-4" aria-busy="true" aria-label="Carregando auditoria">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <TableSkeleton rows={5} />
        <TableSkeleton rows={5} />
      </div>
    </ListingPageShell>
  );
}

if (error) {
  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={hero}
      stats={<ListingMiniStats items={listStats} />}
    >
      <Alert tone="danger">{error}</Alert>
    </ListingPageShell>
  );
}

if (!data) {
  return null;
}

if (!data.ok) {
  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={hero}
      stats={<ListingMiniStats items={listStats} />}
    >
      <Alert tone="warning">
        Base adm_libare_core, modo core e views de auditoria sao necessarios para esta pagina.
      </Alert>
      <p className="mt-2 text-sm text-muted">{auditReasonMessage(data.reason)}</p>
    </ListingPageShell>
  );
}
```

- [ ] **Step 4: Conteúdo sucesso — 4 blocos layout A**

Manter as `columns` `useMemo` atuais. Render:

```tsx
return (
  <ListingPageShell
    breadcrumbs={buildBreadcrumbs(location.pathname)}
    hero={hero}
    stats={<ListingMiniStats items={listStats} />}
  >
    <motion.div
      className="space-y-4 md:space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <Card elevated padding="lg">
        <CardHeader title="Resumo por modulo" />
        <DataTable<AuditModuleSummaryRow>
          columns={moduleColumns}
          data={data.moduleSummary}
          keyExtractor={(row) => row.moduleName}
          emptyMessage="Nenhum registo nas views de resumo."
        />
      </Card>

      <Card elevated padding="lg">
        <CardHeader title="Ultimas exclusoes logicas" description="Ate 100 registos mais recentes" />
        <DataTable<AuditSoftDeleteRow>
          columns={softDeleteColumns}
          data={data.recentSoftDeletes}
          keyExtractor={(row) => `${row.moduleName}|${row.entityId}|${row.deletedAt ?? ""}`}
          emptyMessage="Nenhuma exclusao logica encontrada."
        />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card elevated padding="lg" className="min-w-0">
          <CardHeader title="Atividade por ator" description="Contagem via updated_by" />
          <DataTable<AuditActorActivityRow>
            columns={actorColumns}
            data={data.actorActivity}
            keyExtractor={(row) => String(row.actorId)}
            emptyMessage="Nenhum historico de updated_by."
          />
        </Card>

        <Card elevated padding="lg" className="min-w-0">
          <CardHeader title="Consistencia de soft delete" />
          <DataTable<AuditConsistencyRow>
            columns={consistencyColumns}
            data={data.softDeleteConsistency}
            keyExtractor={(row) => row.checkName}
            emptyMessage="Sem checagens."
          />
        </Card>
      </div>
    </motion.div>
  </ListingPageShell>
);
```

Remover `PageShell` antigo e classes `books-page-stack` / `chart-grid` / `page-card` desta página.

Confirmar que `Card` / `CardHeader` exportam de `../../shared/ui` (já usados em Dashboard). Se `CardHeader` exigir `actions` opcional, ok sem passar.

- [ ] **Step 5: Typecheck**

```powershell
cd frontend-admin ; npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 6: Commit**

```powershell
git add frontend-admin/src/ui/pages/AuditPage.tsx
git commit -m "feat(admin): UX Berry na tela de Auditoria"
```

Não incluir CommentsPage, gradle, tsbuildinfo, dashboard WIP não relacionado.

---

### Task 2: Verificação + spec

- [ ] **Step 1: Grep / checklist**

```powershell
cd frontend-admin ; npx tsc --noEmit
rg "PageShell|page-card|books-page-stack" frontend-admin/src/ui/pages/AuditPage.tsx
rg "ListingPageShell|PageHeroStrip|ListingMiniStats|refetch" frontend-admin/src/ui/pages/AuditPage.tsx
```

Expected: tsc 0; sem `PageShell`/`page-card`/`books-page-stack`; matches de Berry + refetch.

- [ ] **Step 2: Atualizar spec**

Em `docs/superpowers/specs/2026-08-06-auditoria-ux-berry-design.md`:
- Status → `implementado`
- Critérios de pronto → `[x]`

```powershell
git add docs/superpowers/specs/2026-08-06-auditoria-ux-berry-design.md
git commit -m "docs(spec): marcar Auditoria UX Berry como implementada"
```

---

## Spec coverage

| Requisito | Task |
|-----------|------|
| ListingPageShell + hero + KPIs | 1 |
| Ordem layout A (resumo → exclusões → grid) | 1 |
| Botão Atualizar / refetch | 1 |
| Estados loading / erro / ok:false | 1 |
| Sem API nova | — |
| tsc | 1 + 2 |
