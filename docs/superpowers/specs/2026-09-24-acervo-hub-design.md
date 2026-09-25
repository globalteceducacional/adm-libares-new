# Hub do Acervo — design

- **Data:** 2026-09-24
- **Status:** Aprovado (implementação por fases)
- **Relacionado:** ADR 0006 (acervo como vínculo único do leitor)

## Problema

O acervo é o eixo do multi-tenant (contrato → acervo → livros / leitores), mas o painel só mostra
contadores num modal (`AcervoDetailModal`). Para gerir um acervo o admin pula entre `/acervos`,
`/livros` e `/usuarios`, e os filtros de acervo dessas páginas vivem em `useState` (sem deep-link).

## Decisão

Página dedicada **`/acervos/:acervoId`** (`AcervoHubPage`) com cabeçalho + abas **Livros | Leitores**
gerenciáveis inline. `AcervoDetailModal` é removido; clicar na linha da lista navega para o hub.

### Navegação

- Rota guardada por `acervos.view` (reaproveita a permissão de `/acervos`).
- Breadcrumb `Painel › Catálogo › Acervos › {nome}`; aba na URL (`?tab=livros|leitores`, default `livros`).
- Acervo inexistente / fora do contrato → estado "Acervo não encontrado" com link para `/acervos`.

### Cabeçalho

`PageHeroStrip` com nome, contrato, status; `ListingMiniStats` (livros, leitores, livros ativos);
ações **Editar** (abre `AcervoFormModal`), **Ativar / Desativar** (com `ConfirmDialog`).

### Aba Livros

- Lista: `useBooksQuery(acervoId)`; busca + status (`useAdminListFilters`); colunas capa · título · autor · status.
- Por linha: **Ativar/Desativar** (`PATCH /books/{id}/status`, `books.toggle_status`),
  **Remover do acervo** (`ConfirmDialog`; `acervos.update`).
- **Adicionar livros**: modal com `SearchableCheckboxList` dos livros ainda fora do acervo.
- **Backend novo:** `PUT /api/v1/acervos/{id}/books` `{ add: number[], remove: number[] }` →
  `SyncAcervoBooksUseCase` (transacional). Regras: `AcervoPolicy.loadForUpdate`; livros existem;
  acervo ativo; recusa `remove` que deixaria livro **sem nenhum** acervo (400 listando títulos, pois
  `SyncBookAcervosUseCase` já exige ≥ 1). Idempotente: `add` de vínculo existente é ignorado.

### Aba Leitores

- Lista: `useUsersQuery(acervoId)`; colunas avatar · nome · e-mail · status.
- Por linha: **Ativar/Desativar** (`users.block` / `users.update`), **Desvincular**
  (`PUT /users/{id}/acervo {acervoId:null}`, com `ConfirmDialog`).
- **Adicionar leitores**: modal com `SearchableCheckboxList` de leitores elegíveis — sem acervo ou de
  outro acervo do mesmo contrato (a lista já vem filtrada pelo tenant); sublabel mostra o acervo atual
  para deixar claro que é troca. Confirmação → chamadas sequenciais a `PUT /users/{id}/acervo` com
  relatório final ("N vinculados, M falharam: …"). Sem backend novo.

### Deep-links

`BooksPage` e `UsersPage` passam a ler/escrever `?acervoId=` via extensão de `useAdminListFilters`.
O hub oferece "Ver em Livros / Ver em Usuários" já filtrados.

### Segurança / erros

- Escrita gated por `acervos.update`, `books.toggle_status`, `users.update`, `users.block`.
- Todas as mutations via `useAdminMutation` (toast + invalidação `books`, `users`, `acervos`, `acervoOptions`).
- `ConfirmDialog` em toda ação destrutiva (inclui desvincular no `UserDetailModal`, que hoje não tem).

### Fora de escopo

Drag-and-drop, paginação server-side, bulk de status, endpoint bulk de leitores.

## Verificação

`tsc -b`, `compileKotlin`, IT `SyncAcervoBooksIT` (add, remove, recusa último acervo, 403 outro contrato).
