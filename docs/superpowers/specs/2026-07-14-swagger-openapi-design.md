# Swagger / OpenAPI — documentação admin + leitor

**Data:** 2026-07-14  
**Status:** Aprovado — plano em `docs/superpowers/plans/2026-07-14-swagger-openapi.md`  
**Escopo:** Documentação OpenAPI 3 + Swagger UI no backend Spring Boot; consumo por humanos (Try-it-out) e por Flutter (contrato leitor)

**Relacionado:**
- Spec leitor: `docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md`
- Plano leitor: `docs/superpowers/plans/2026-07-08-reader-api-php-mirror.md`

## Problema

O backend admin (`/api/v1/**`) e o contrato do app Flutter (espelho PHP) não têm documentação interativa unificada. Sem Swagger/OpenAPI:

- o time não testa rotas admin com exemplos/schemas claros;
- o Flutter não tem um contrato máquina-legível canónico enquanto os controllers Kotlin do leitor ainda não existem;
- o acesso público a `/swagger-ui` seria risco de enumeração de superfície.

## Decisões

| Tema | Decisão |
|------|---------|
| Abordagem | **SpringDoc OpenAPI 3** + YAML estático do contrato leitor mesclado |
| Escopo UI | **Uma** Swagger UI; tags separadas Admin vs Leitor |
| Acesso à UI / api-docs | Somente com **JWT admin** (Bearer) |
| Admin | Anotações nos controllers (+ schemas dos DTOs) |
| Leitor | Documentar **contrato completo** espelho PHP **mesmo sem controllers** Kotlin |
| Envelope leitor | Documentar `EBOOK_APP` (array vs objeto `home`) com exemplos |
| Jogos | Fora de escopo (`api_jogos.php` não documentar nesta fase) |
| Client gerado Flutter | Fora de escopo desta entrega; possível passo seguinte a partir de `/v3/api-docs` |
| Publicação | Local + VPS; proxy nginx opcional (recomendado) para `/swagger-ui` e `/v3/api-docs` |

## Abordagens consideradas

| Abordagem | Resultado |
|-----------|-----------|
| **1 — SpringDoc + YAML leitor (escolhida)** | Admin a partir do código; leitor a partir do contrato canónico |
| 2 — Só SpringDoc nos controllers existentes | Não cobre leitor até haver controllers |
| 3 — Só OpenAPI YAML estático (admin + leitor) | Duplica schemas admin; drift fácil |

---

## Arquitetura

```
Dev / App Flutter
       │
       │  Browser: JWT admin → Authorize
       │  Flutter: consome JSON OpenAPI (contrato)
       ▼
┌─────────────────────────────────────────────┐
│ Spring Boot                                 │
│  /swagger-ui/**   (exige JWT admin)         │
│  /v3/api-docs/**  (exige JWT admin)         │
│                                             │
│  OpenAPI merge:                             │
│   • Controllers /api/v1/** (Admin)          │
│   • openapi/reader-php-mirror.yaml (Leitor) │
│                                             │
│  Security scheme: bearer-jwt                │
└─────────────────────────────────────────────┘
       │
       ├─► Try-it-out Admin → /api/v1/** (auth real)
       └─► Try-it-out Leitor → paths documentados
            (implementação Kotlin pode ainda 404
             até o cutover do espelho PHP)
```

### Dependência

- `org.springdoc:springdoc-openapi-starter-webmvc-ui` compatível com **Spring Boot 3.x** do `backend/build.gradle.kts`
- Sem inventar versão fixa neste spec: alinhar à matriz springdoc ↔ Boot no momento da implementação

### Artefatos

| Artefato | Caminho / URL |
|----------|----------------|
| YAML contrato leitor | `backend/src/main/resources/openapi/reader-php-mirror.yaml` (pode ser split em vários e `openapi-merge` / `GroupedOpenApi` se crescer) |
| Config OpenAPI | Bean(s) Kotlin em `shared/openapi/` (ex.: `OpenApiConfig`) |
| UI | `/swagger-ui.html` (redirect springdoc) |
| Spec agregada | `/v3/api-docs` (e grupos, se usados) |

---

## Segurança

1. **`SecurityConfig`:** `swagger-ui` e `v3/api-docs` **não** ficam em `permitAll`.
2. Requisição sem Bearer válido → **401**.
3. Fluxo esperado:
   - `POST /api/v1/auth/login` (público) → token
   - Colar token em **Authorize** (schema `bearer-jwt`)
   - Navegar Swagger / Try-it-out
4. Rotas **documentadas** do leitor permanecem **públicas no contrato** (como o PHP); isso não isenta a **UI** do Swagger do JWT admin.
5. Não expor secrets, hashes ou payloads internos de erro nas descrições/exemplos.

---

## Tags (organização)

### Admin

- `Admin - Auth`
- `Admin - Books`
- `Admin - Users`
- `Admin - Comments`
- `Admin - Dashboard`
- `Admin - Audit`

Quando a branch expuser os módulos: `Admin - Acervos`, `Admin - Roles`, `Admin - Schools` (mesma UI, tags adicionais).

### Leitor

- `Leitor - Auth` — `user_login_api.php`, register, forgot, profile
- `Leitor - Catalog` — `home`, `latest`, `allbook`, `search_text`, `cat_*`, `author_*`, `book_id`, `home_section*`
- `Leitor - Social` — comments, rating, favourite, wishlist
- `Leitor - Reading` — page state, continue reading
- `Leitor - App` — `app_details`, `removeuser`, `delete_userdata`
- `Leitor - Sites` — `api_sites.php`

---

## Conteúdo Admin

- `@Tag` / `@Operation` / `@Parameter` / `@ApiResponse` nos controllers `/api/v1/**`
- Schemas derivados dos DTOs request/response
- Documentar erros HTTP relevantes (401, 403, 404, 400) de forma genérica via handler, sem vazar stack
- Multipart (upload de capa) descrito onde existir

---

## Conteúdo Leitor (contrato canónico)

Fonte de verdade funcional: PHP legado + spec `2026-07-08-reader-api-php-mirror-design.md`.

Para cada rota / `method_name`:

| Campo na doc | Conteúdo |
|--------------|----------|
| Path | Ex.: `/api.php`, `/user_login_api.php` |
| Method | GET e/ou POST conforme uso Flutter |
| Params | Query/body (`method_name`, ids, tokens, etc.) |
| Response | Envelope `{ "EBOOK_APP": ... }` com exemplo |
| Notas | Array vs objeto (ex. `home`); campos `success` / `MSG` |
| Status | Descrição: “implementação Kotlin pendente — contrato espelho PHP” até o cutover |

Lista mínima de `method_name` a documentar (alinhada ao spec do leitor):

`home`, `latest`, `allbook`, `search_text`, `cat_list`, `cat_id`, `author_list`, `author_id`, `book_id`, `home_section`, `home_section_id`, `add_comment`, `get_all_comments`, `removecomment`, `submit_rating`, `rating_check`, `toggle_favourite`, `favourite_list`, `toggle_wishlist`, `wishlist_list`, `book_page_state_list`, `book_page_state_save`, `continue_reading`, `con_reding_book`, `removeuser`, `delete_userdata`, `app_details`

Mais rotas `user_*.php` e `api_sites.php` conforme tabelas do spec do leitor.

**Importante:** documentar o contrato **antes** dos controllers não é mentira de runtime — a UI deve deixar claro que Try-it-out no VPS pode devolver 404 até a implementação do módulo `reader`.

---

## Publicação / Deploy

| Ambiente | Comportamento |
|----------|----------------|
| Local | Swagger em `http://localhost:8080/swagger-ui.html` com JWT |
| VPS | Mesmo backend; nginx do frontend **recomendado** a proxyar `/swagger-ui` e `/v3/api-docs` (same-origin), espelhando o padrão de `/api` |

Não é obrigatório publicar o YAML bruto no GitHub Pages; a fonte no repo é `resources/openapi/`.

---

## Fora de escopo

- Implementar controllers Kotlin do leitor
- Documentar `api_jogos.php`
- Geração automática de SDK Flutter / Dart
- Documentação GraphQL ou Postman collection (opcional depois, exportando OpenAPI)

---

## Critérios de aceite

- [ ] Com JWT admin válido, Swagger abre e lista tags Admin + Leitor
- [ ] Sem JWT, `/swagger-ui/**` e `/v3/api-docs/**` retornam **401**
- [ ] `POST /api/v1/auth/login` documentado e Try-it-out funcional
- [ ] Endpoints leitor com params + exemplo `EBOOK_APP`
- [ ] Controllers admin existentes com `@Tag`/`@Operation` e schemas coerentes com DTOs
- [ ] Nenhum secret em exemplos; erros sem stack trace na doc

---

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Drift entre YAML leitor e PHP/Flutter | Uma pessoa DRI do contrato; checklist no plano do leitor ao mudar method |
| SpringDoc abre api-docs por engano | Teste de integração: 401 sem token |
| Try-it-out leitor 404 confunde QA | Nota visível na descrição OpenAPI + link ao spec de cutover |
| Branch `postgres` sem RBAC completo | Tags Admin só para o que existir na branch; RBAC quando merged |

---

## Próximo passo

Após review deste arquivo: plano em `docs/superpowers/plans/2026-07-14-swagger-openapi.md` (skill writing-plans) e só então implementação.
