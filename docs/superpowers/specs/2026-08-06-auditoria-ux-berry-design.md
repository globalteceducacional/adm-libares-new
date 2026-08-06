# Auditoria — UX Berry (layout A)

**Data:** 2026-08-06  
**Status:** aprovado; plano em `docs/superpowers/plans/2026-08-06-auditoria-ux-berry.md`  
**Escopo:** `frontend-admin` — página `/auditoria` (somente UI; API `/api/v1/audit/overview` inalterada)

## Problema

A tela de Auditoria usa cards legados (`page-card`), sem hero/stats Berry, e não segue o padrão visual das demais páginas do Sistema. Os dados (resumo, soft-deletes, atores, consistência) já existem na API; falta hierarquia e consistência de UX.

## Decisões de produto

- **Objetivo:** UX / Berry — mesmos dados, layout alinhado ao admin.
- **Layout:** A — empilhado + KPIs (hero → mini-stats → tabelas).
- **Sem** filtros avançados, export, restore, ou novos endpoints nesta entrega.

## Layout

```
[ ListingPageShell ]
  Hero: Auditoria + botao Atualizar (refetch)
  ListingMiniStats: 4 KPIs derivados do overview

  Secao: Resumo por modulo (DataTable)
  Secao: Ultimas exclusoes logicas (DataTable)
  Grid 2 col: Atividade por ator | Consistencia soft delete
```

## Conteúdo

### KPIs (derivados no front)

| Label | Cálculo |
|-------|---------|
| Modulos | `moduleSummary.length` |
| Registos totais | soma de `totalRows` |
| Soft-deletes (resumo) | soma de `softDeletedRows` |
| Exclusoes listadas | `recentSoftDeletes.length` |

### Tabelas (inalteradas em colunas)

- Resumo: módulo, total, ativos, excluídos lógicos  
- Soft-deletes: módulo, ID, descrição, excluído por, data  
- Atores: ID ator, alterações  
- Consistência: verificação, inconsistências  

### Estados

- Loading: skeleton no shell Berry  
- Erro HTTP: `Alert` danger  
- `ok: false`: `Alert` warning + `auditReasonMessage(reason)` (CORE_MODE / VIEWS / QUERY)  
- Sucesso: layout acima  

### Interação mínima

- Botão **Atualizar** no hero: `auditQuery.refetch()` (ou invalidate `queryKeys.audit`)

## Técnico

- **Arquivo:** `frontend-admin/src/ui/pages/AuditPage.tsx` — reorganizar para `ListingPageShell` / `PageHeroStrip` / `ListingMiniStats`.
- **Reusar:** `DataTable`, `useAuditQuery`, tipos em `types/audit.ts`, `formatInstant` local.
- **Opcional:** `AdminListingSection` se encaixar sem forçar filtros vazios; senão cards Berry com `Card`/`elevated` + header.
- **Ícone hero:** `ClipboardList` (já usado na nav).
- **Sem:** mudanças em `backend`, views SQL, permissões novas.

## Critérios de pronto

- [ ] Página usa `ListingPageShell` + hero + mini-stats
- [ ] Quatro blocos de dados preservados na ordem do layout A
- [ ] Botão Atualizar dispara refetch
- [ ] Estados loading / erro / `ok:false` cobertos
- [ ] `npx tsc --noEmit` passa

## Fora de escopo

- Filtros, busca, paginação server-side, export CSV  
- Restore de soft-delete / deep-link para entidade  
- Resolver username a partir de `actorId` / `deletedBy`  
- Mudança de `APP_DATA_MODE` ou scripts de views
