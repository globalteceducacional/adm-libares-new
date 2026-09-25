# Plano — Hub do Acervo

Spec: [2026-09-24-acervo-hub-design.md](../specs/2026-09-24-acervo-hub-design.md)

## Fase 1 — Backend: sync de livros do acervo
- [x] `LivroAcervoJpaRepository`: `findByAcervoId`, `deleteByAcervoIdAndBookIdIn`
- [x] DTO `SyncAcervoBooksRequest { add, remove }`
- [x] `SyncAcervoBooksUseCase` (policy, validações, "último acervo", idempotente)
- [x] `PUT /api/v1/acervos/{id}/books` no `AcervoController` → retorna `AcervoResponse` atualizado
- [x] `SyncAcervoBooksIT` (add idempotente, remove, recusa último acervo, add∩remove, livro inexistente)
- [x] `compileKotlin compileTestKotlin`

## Fase 2 — Frontend: página do hub + aba Livros
- [x] `shared/ui/Tabs.tsx` (`Tabs` + `TabPanel`, tablist acessível, setas/Home/End, controlado)
- [x] `acervosService.getAcervo`, `syncAcervoBooks`; `useAcervoQuery(id)` (chave `["acervos","detail",id]`)
- [x] Rota `/acervos/:acervoId` (guard `acervos.view`), `AcervosPage` navega no clique, `AcervoDetailModal` removido
- [x] `useAcervoManager` (form/ativar/desativar compartilhado entre lista e hub)
- [x] `AcervoHubPage`: breadcrumb dinâmico, hero, stats, Editar/Ativar/Desativar, estado "não encontrado"
- [x] `AcervoBooksTab` + `AddBooksToAcervoModal`
- [x] `tsc -b`

## Fase 3 — Aba Leitores
- [x] `AcervoReadersTab` + `AddReadersToAcervoModal` (loop sequencial com progresso, relatório no modal)
- [x] `ConfirmDialog` no desvincular (hub e `UserDetailModal`)
- [x] `tsc -b`

## Fase 4 — Deep-links
- [x] `useAdminListFilters({ syncAcervo })` lê/escreve `?acervoId=` (`none` = sem acervo)
- [x] `BooksPage` / `UsersPage` usam o filtro da URL; links "Ver em Livros / Ver em Usuários" no hub
- [x] `tsc -b`, `vite build`

## Pendências fora do código
- Rodar `SyncAcervoBooksIT` com MySQL local (requer contrato ativo e usuário `teste.admin`).
- Validar visualmente o hub em desktop e mobile após deploy.
