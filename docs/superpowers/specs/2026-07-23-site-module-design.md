# Módulo Site (admin + API leitor) — design

**Data:** 2026-07-23  
**Status:** Implementado — ver plano docs/superpowers/plans/2026-07-23-site-module.md  

**Escopo:** Admin React + backend Kotlin (`modules/site/`) + espelho `/api_sites.php`

## Problema

O menu **Site** no PHP legado (`adm-libares`) é um catálogo paralelo ao ebook (Sites, autores, categorias, seções, comentários) em tabelas próprias, **sem** escola/acervo. O painel React+Kotlin ainda não cobre Site; o app Flutter Site ainda depende 100% de `api_sites.php`. Enquanto isso existir, o PHP não pode ser desligado para essa frente.

## Decisões

| Tema | Decisão |
|------|---------|
| Escopo desta entrega | **CRUD admin Site completo** + **espelho leitor** `api_sites.php` |
| Tenant | **Global** (como o legado; sem `school_id` / acervo) |
| API admin | REST moderno `/api/v1/sites*` (JWT + RBAC) |
| API leitor | Espelho legado `/api_sites.php?method_name=...` + envelope **`Galileu`** agora; REST moderno admin já serve de base para o futuro |
| Permissões | Novas **`sites.*`** (isoladas de `books.*`) |
| Assets | Reutilizar `/legacy/assets` e pastas `images/` / `images/thumbs/` / `uploads/` do legado |
| Cascata delete | Corrigir bugs do PHP que apagam/tocam `tbl_books` / `tbl_comments` — operar só nas tabelas Site |
| Jogos / Notificações / Config / `api.php` ebook | **Fora** deste spec |

## Abordagens consideradas

| Abordagem | Descrição | Resultado |
|-----------|-----------|-----------|
| **A — Domínio único `modules/site/` + dois adapters (escolhida)** | Use cases compartilhados; admin REST + dispatcher legado | Uma fonte de verdade; atende B (admin + leitor) |
| B — Só espelho leitor agora | Portar `ApiSitesController`; admin depois | Não atende pedido de CRUD React nesta entrega |
| C — Unificar em `catalog` | Mesmo módulo de livros | Mistura tenant/permissões/tabelas; rejeitada |

---

## Arquitetura

```
React Admin                    Flutter (app Site)
    │                               │
    ▼                               ▼
/api/v1/sites/**              /api_sites.php?method_name=...
(JWT + sites.*)               (público, envelope Galileu)
    │                               │
    └───────────┬───────────────────┘
                ▼
     modules/site/application
     (use cases compartilhados)
                ▼
     JPA → Sites, Autores_site, Categoría_site,
           Seções_site, Comentarios_site, rating_sites, …
                ▼
     Assets: /legacy/assets (images/, uploads/)
```

- Pacote novo `modules/site/` — **não** misturar com `modules/catalog` (ebook).
- Controller leitor: `ApiSitesController` + dispatcher por `method_name` (borda legada); chama use cases / queries do domínio Site.
- Security: rotas `/api_sites.php` **públicas** (como PHP); admin em `/api/v1/**` autenticado.
- Config existente: `app.legacy.public-base-url`, `app.legacy.assets.root`.

### Fora de escopo

- Cutover completo de `api.php` / `user_*.php` (ebook)
- Notificações, Configurações, Jogos
- Multi-tenant em Site
- Mudanças no Flutter além de apontar o host para o Kotlin quando o espelho estiver pronto

---

## Permissões RBAC

Flyway seed (+ atribuição a perfis platform / super-admin). Perfis `SCHOOL_ADMIN` **não** recebem `sites.*` por padrão.

**Exceção:** role `PROFESSOR` recebe `sites.view` + `sites.toggle_status` (V20 + `ProvisionSchoolRolesUseCase`).

| Código | Uso |
|--------|-----|
| `sites.view` | Listar/detalhar Sites (e itens admin conforme nav) |
| `sites.create` | Criar |
| `sites.update` | Editar + toggle status/featured (CRUD completo) |
| `sites.delete` | Excluir (cascata correta nas tabelas Site) |
| `sites.toggle_status` | Ativar/desativar Site sem CRUD (role PROFESSOR) |
| `sites.comments.view` | Listar comentários Site |
| `sites.comments.moderate` | Remover comentários |

Policies no estilo `BookPolicy` → `SitePolicy` / `SiteCommentPolicy`.

---

## Modelo de dados (legado existente)

Confirmado via código PHP canónico (`adm-libares/*_site.php`, 2026-07-23). Encoding com acentos nos nomes de tabela é real — usar o Unicode exacto em `@Table`.

### `Sites` (PK `id`)

`cat_id` (CSV), `aid`, `book_title`, `book_description`, `book_cover_img`, `book_file_type` (`server_url` \| `local`), `book_file_url`, `featured`, `status`, `total_rate`, `rate_avg`, `book_views`  
(legado de delete também menciona `book_bg_img`)

### `Autores_site` (PK `author_id`)

`author_name`, `author_description`, `author_image`, **`a_status`** (`"0"`\|`"1"`)

### `Categoría_site` (PK `cid`)

`category_name`, `category_image`, **`cat_status`**

### `Seções_site` (PK `id`)

`section_title`, `section_books` (CSV de IDs de `Sites`), `status`

### `Comentarios_site` (PK `id`)

`book_id`, `user_id`, `user_name`, `user_email`, `user_image`, `user_type`, `comment_text`, `dt_rate`, `comment_on`

### Auxiliares leitor

- `rating_sites` — `rating_check`
- `vizualização_site` — `continue_reading` / `con_reding_book`
- `tbl_users` / `tbl_settings` — `removeuser`, `delete_userdata`, `app_details` (paridade com PHP)

---

## Superfície da API

### Admin REST (`/api/v1/...`, JWT)

| Recurso | Rotas |
|---------|--------|
| Sites | `GET/POST /sites`, `PUT/DELETE /sites/{id}`, `PATCH /sites/{id}/status`, upload capa/arquivo |
| Autores | `/site-authors` |
| Categorias | `/site-categories` |
| Seções | `/site-sections` |
| Comentários | `GET /site-comments`, `DELETE /site-comments/{id}` |

Sem parâmetro de acervo/escola. Validações alinhadas ao PHP: categorias ≥1, autor, título, descrição, capa no create, `book_file_type` + URL ou arquivo local.

Erros: envelope JSON padrão do backend (400/401/403/404).

### Leitor — espelho (`/api_sites.php`)

Envelope raiz: **`Galileu`** (não `EBOOK_APP`).

`method_name`:  
`home`, `cat_list`, `cat_id`, `author_list`, `author_id`, `latest`, `allbook`, `search_text`, `book_id`, `home_section`, `home_section_id`, `get_all_comments`, `removecomment`, `rating_check`, `continue_reading`, `con_reding_book`, `removeuser`, `delete_userdata`, `app_details`

URLs de imagem/arquivo: `{publicBase}/legacy/assets/...`.

Erros: manter shape legado do PHP para não quebrar o Flutter.

**Fonte PHP canónica:** `C:\Users\User\Repository\adm-projeto\adm-libares\api_sites.php`  
(Telas admin: `manage_*_site.php`, `add_*_site.php`, `edit_*_site.php`, `secoes_site.php`, ramos Site em `processdata.php`.)

---

## Frontend React

Novo grupo de menu **Site** (paralelo a “Catálogo”):

| Item | Rota | Permissão |
|------|------|-----------|
| Sites | `/sites` | `sites.view` |
| Autores | `/sites/autores` | `sites.update` (CRUD; professor sem esta perm nao ve o item) |
| Categorias | `/sites/categorias` | `sites.update` |
| Seções | `/sites/secoes` | `sites.update` |
| Comentários | `/sites/comentarios` | `sites.comments.view` |

- Create/edit de **Sites** em **modal** (`SiteFormModal`), padrao Livros.
- Role **PROFESSOR**: `sites.view` + `sites.toggle_status`; UI so listagem + Ativar/Desativar.
- API: `PATCH /api/v1/sites/{id}/status`.
- Sem seletor de acervo/escola (Site continua global).
- Comentários: listagem + delete (completar o que o PHP deixou incompleto).
- Services tipados apontando para `/api/v1/sites*`.

---

## Testes

| Tipo | Cobertura |
|------|-----------|
| IT admin | CRUD Site + autores/categorias/seções; upload; 403 sem `sites.*` |
| IT leitor | `ApiSitesIT`: smoke `home` / `cat_list` / `book_id`; envelope `Galileu`; URLs `/legacy/assets` |
| Unitário / IT delete | Cascata só em tabelas Site (não tocar `tbl_books`) |

---

## Critérios de aceite

- [x] Painel administra Sites/Autores/Categorias/Seções/Comentários sem PHP
- [ ] App Site funciona apontando host para Kotlin em `/api_sites.php`
- [x] Permissões `sites.*` controlam menu e APIs admin
- [x] Create/edit Sites em modal; PROFESSOR com view + toggle (`sites.toggle_status`)
- [x] Delete de Site não remove dados de ebook (`tbl_books` / `tbl_comments`)
- [x] Telas `*_site.php` e `api_sites.php` PHP podem ser desligadas após cutover

## Relação com docs existentes

- Cutover leitor ebook+site (parcial): `docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md` e plano `2026-07-08-reader-api-php-mirror.md` (Task 7)
- Handoff leitor: `docs/superpowers/plans/2026-07-09-reader-api-resume-handoff.md` (CRUD Site = prioridade 2)
- Este spec **fecha** o CRUD admin Site + espelho `api_sites.php` como entrega unificada do domínio Site
)
