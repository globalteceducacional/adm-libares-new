# APIs do leitor (espelho PHP) — design de cutover

**Data:** 2026-07-08  
**Status:** Aprovado — plano em `docs/superpowers/plans/2026-07-08-reader-api-php-mirror.md`  
**Escopo:** Backend Kotlin (Spring) compatível com o app Flutter; desligar PHP do ebook + Site

## Problema

O painel admin React+Kotlin já cobre o núcleo do ebook. O app leitor (Flutter) ainda depende 100% das APIs PHP (`api.php`, `user_*.php`, `api_sites.php`). Enquanto isso persistir, o processo PHP/Apache não pode ser desligado.

## Decisões

| Tema | Decisão |
|------|---------|
| Compatibilidade | **Espelho PHP** — mesmas rotas, query strings e envelope `EBOOK_APP` |
| Flutter | Troca apenas o **host** (base URL); contrato permanece |
| Escopo conteúdo | **Ebook + Site**; Jogos fora desta fase |
| Auth leitor | **Upgrade-on-login**: aceita plaintext legado, BCrypt e Argon2; no sucesso regrava BCrypt |
| Novos usuários | Só hash (nunca plaintext) |
| Assets | Servir via `/legacy/assets/**` já existente; URLs nas respostas apontam para `{publicBase}/legacy/assets/...` |
| Admin PHP ebook | Considerado substituído pelo React (exceto menus restantes: Perfil/Config/Notificações/Site — outro spec) |

## Abordagens consideradas

| Abordagem | Resultado |
|-----------|-----------|
| **A — Controllers espelho (escolhida)** | Rotas `/api.php`, `/user_*.php`, `/api_sites.php` no Spring |
| B — Fachada + use cases limpos com um router | Mais limpa; adiada (pode ser refactor interno depois) |
| C — Proxy PHP gradual | Mantém PHP ligado; descartada para cutover rápido |

---

## Arquitetura

```
Flutter ──► /api.php?method_name=home
            /user_login_api.php
            /api_sites.php?...
                 │
                 ▼
┌──────────────────────────────────────┐
│ modules/reader/ (legado na borda)    │
│  ApiPhpController                    │
│  UserLoginController, ...            │
│  ApiSitesController                  │
│  EbookAppEnvelope (EBOOK_APP[])      │
│  ReaderPasswordService (upgrade)     │
└──────────────────────────────────────┘
                 │
                 ▼
         MySQL legado (tbl_*, Sites, …)
         + /legacy/assets (images, uploads)
```

**Security:** rotas do leitor **públicas** (sem JWT admin), refletindo o PHP atual. Admin continua em `/api/v1/**` autenticado.

**Config:**
- `app.legacy.public-base-url` — base absoluta nas URLs de imagem/arquivo
- `app.legacy.assets.root` — pasta `adm-libares`

---

## Superfície da API

### Rotas ebook

| Rota | Papel |
|------|--------|
| `/api.php` | Dispatcher `method_name` (GET/POST) |
| `/user_login_api.php` | Login Normal / Google / Facebook |
| `/user_register_api.php` | Registro |
| `/user_register_galileu.php` | Variante (stub compatível se ainda referenciada) |
| `/user_forgot_pass_api.php` | Reset **sem** enviar senha em claro no e-mail |
| `/user_profile_api.php` | Perfil |
| `/user_profile_update_api.php` | Update perfil + imagem |

### `method_name` em `/api.php` (mínimo)

`home`, `latest`, `allbook`, `search_text`, `cat_list`, `cat_id`, `author_list`, `author_id`, `book_id`, `home_section`, `home_section_id`, `add_comment`, `get_all_comments`, `removecomment`, `submit_rating`, `rating_check`, `toggle_favourite`, `favourite_list`, `toggle_wishlist`, `wishlist_list`, `book_page_state_list`, `book_page_state_save`, `continue_reading`, `con_reding_book`, `removeuser`, `delete_userdata`, `app_details`

Envelope: `{ "EBOOK_APP": [ ... ] }` com as mesmas chaves que o PHP devolve hoje.

### Site

| Rota | Papel |
|------|--------|
| `/api_sites.php` | Paridade funcional de `api_sites.php` (tabelas Site / categorías / autores / seções / comentários do site) |

Detalhamento de `method_name` de sites: espelhar o PHP existente no plano de implementação (lista canónica a partir de `api_sites.php` + `api_urls.php`).

### Fora de escopo

- `api_jogos.php` e CRUDs de Jogos no admin
- REST limpa `/api/v1/reader/**` (fase futura opcional)
- `APP_DATA_MODE=core`

---

## Senhas

1. Login verifica em ordem: BCrypt/Argon2 (`PasswordEncoder` / `password_verify` equivalente) **ou** igualdade plaintext legado.
2. Se match plaintext ou Argon2 legado: **regravar** BCrypt em `tbl_users.password`.
3. Registro / update de senha no espelho: **só hash**.
4. Forgot-password: token ou senha temporária hasheada + e-mail **sem** senha em claro (melhoria de segurança vs PHP atual; documentar desvio de MSG se o texto do app esperar a senha antiga).

---

## Ondas de implementação

| Onda | Conteúdo |
|------|----------|
| **1** | Infra: Security permitAll, envelope, asset URL builder, `ReaderPasswordService` |
| **2** | Auth: login / register / profile / forgot |
| **3** | Catálogo ebook: home, books, cats, authors, sections, search |
| **4** | Social/leitura: comments, ratings, fav/wishlist, continue, page state |
| **5** | `app_details` + `api_sites.php` |
| **6** | Smoke Flutter + cutover DNS/host → desligar PHP ebook/site |

---

## Testes

- Fixtures golden: capturar respostas PHP reais (dev) e comparar chaves/campos estáveis (ignorar timestamps voláteis).
- IT login: plaintext → upgrade; BCrypt ok; senha errada.
- IT smoke por `method_name` crítico: `home`, `book_id`, `cat_list`, login.
- Smoke Flutter apontando para o host Kotlin.

---

## Cutover operacional

1. Homolog: Flutter aponta base URL para Spring.
2. Validar ebook + Site no app.
3. Produção: DNS/proxy do host legado → Kotlin (ou update de config do app).
4. Desligar Apache/PHP do ebook e das APIs Site.
5. Manter pasta `images/`/`uploads/` acessível via `LEGACY_ASSETS_ROOT` (ou migrar para disco/CDN depois).

---

## Relação com menus admin restantes

Spec **separado** (próximo): Perfil + Configurações + Notificações + **CRUD Site** no React.  
As APIs Site do leitor (`api_sites.php`) podem entrar nesta spec de cutover **antes** do CRUD Site no admin estar completo, desde que os dados já existam no MySQL.

---

## Critérios de aceite

- [ ] App ebook funciona só com host Kotlin (sem PHP)
- [ ] App Site (se usado) funciona via `api_sites.php` no Kotlin
- [ ] Usuários plaintext migram senha no primeiro login bem-sucedido
- [ ] Usuários criados no admin (BCrypt) logam no app
- [ ] Assets resolvem via `/legacy/assets`
- [ ] Jogos não bloqueiam o cutover do ebook/site

---

## Próximo passo

Após aprovação desta spec: `writing-plans` → plano por onda (1–6), depois execução. Em paralelo ou em seguida: brainstorming dos menus admin (Perfil → Config → Notificações → Site).

