# ADR 0006 — Acervo como vínculo único do leitor (escola derivada)

- **Status:** Aceito
- **Data:** 2026-09-23
- **Tags:** backend, multi-tenant, users, reader-api

## Contexto

O leitor (`tbl_users`) tinha **duas** referências de tenant independentes:

- `tbl_users.acervo_id` → usado pelo **app** (`ReaderAcervoFilter`) para filtrar livros
- `tbl_users.school_id` → cópia denormalizada usada pelo **painel** para listar/autorizar

Ninguém mantinha a cópia: `UpdateAcervo` trocando escola não propagava, `V17` fez backfill
com a “primeira escola do banco”, o create atual gravava `NULL`. Consequências observadas:

1. Leitor sem acervo sumia da lista da própria escola (`u.school_id = :tenant` nunca casa com NULL)
2. Leitor sem acervo via o **catálogo global** no app (`joinAndClause(null) == ""`)
3. `acervo_id` vindo na query do app sobrescrevia o do usuário sem checar posse
4. `assertSameSchool(null)` sempre Forbidden vs `UserPolicy` liberando geral para `school_id NULL`
5. Não havia como **desvincular** acervo pela UI

## Decisão

**O acervo é o único vínculo do leitor. A escola é sempre derivada de `acervos.school_id`.**

| Regra | Implementação |
|-------|---------------|
| `tbl_users.school_id` deixa de ser lida/escrita | Removida da `UserEntity`; coluna fica no banco até migração de drop futura |
| Listagem do painel filtra pela escola do acervo | `LEFT JOIN acervos a` + `a.school_id = :tenant` |
| Leitor **sem acervo** = “não reivindicado” | Visível para qualquer admin com `users.view` (aparece na visão de escola também); editável por quem tem a permissão da ação |
| Leitor **com acervo** | Só editável por quem acessa a escola do acervo (`assertSameSchool(acervo.schoolId)`) |
| Vincular acervo | Acervo ativo, com escola, e escola acessível pelo ator |
| Desvincular acervo | `PUT /users/{id}/acervo` com `acervoId: null` |
| App: leitor sem acervo | **Catálogo vazio** (home, listas, seções, busca, detalhe) |
| App: `user_id` presente | `acervo_id` da query é **ignorado**; vale o do usuário |
| Acervo sem escola (legado) | Mesma regra de “não reivindicado”: editável por quem tem permissão |

`UserResponse` passa a expor `schoolId` / `schoolName` derivados.

## Consequências

**Positivas**

- Uma única fonte de verdade; impossível divergir painel × app
- Admin de escola consegue criar sem acervo e depois vincular (o órfão aparece na lista)
- Fecha o vazamento de catálogo para leitor sem acervo e o `acervo_id` spoofado com `user_id`

**Negativas / atenção**

- Leitores auto-cadastrados no app (`ReaderRegisterUseCase`) ficam com **catálogo vazio** até um admin vincular — é o comportamento desejado, mas muda o que o app mostra hoje
- Órfãos são visíveis/editáveis por admins de qualquer escola (decisão consciente: sem dono, não há tenant a proteger). Se isso for indesejado, a alternativa é o modelo B (escola obrigatória no leitor)
- Requisições **sem** `user_id` mantêm o comportamento legado (honram `acervo_id`; sem nada → global). A API do app não tem token, então não há como validar posse nesse caso
- `tbl_users.school_id` vira coluna morta; drop em migração separada após deploy estável

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| **Modelo B**: escola obrigatória no leitor, acervo opcional dentro dela | Exige escola no create (contraria o fluxo pedido) e mantém duas colunas para sincronizar |
| Manter `school_id` e propagar no `UpdateAcervo` | Continua frágil (todo novo caminho de escrita precisa lembrar); não resolve o backfill divergente |
| Órfãos só para super admin | Torna “criar sem acervo, vincular depois” inviável para admin de escola |
