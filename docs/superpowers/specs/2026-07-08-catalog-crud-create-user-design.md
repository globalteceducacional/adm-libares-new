# Catálogo CRUD + Criar Usuário — design (prioridade alta)

**Data:** 2026-07-08  
**Status:** Implementado (2026-07-08) — regressão IT + `npm run build` OK  
**Escopo:** Admin React + backend Kotlin (`APP_DATA_MODE=legacy`)

## Problema

No PHP (`adm-libares`) existem CRUDs de **categorias**, **autores**, **seções home** e **criar usuário** do app. O painel novo só expõe:

- Autores: listagem read-only via `GET /books/author-options`
- Categorias / seções home: apenas options no formulário de livro
- Usuários: listar, status, acervo, delete — **sem create** (`users.create` só no seed)

Isso impede desligar o admin PHP para o núcleo do catálogo e do cadastro de leitores.

## Decisões

| Tema | Decisão |
|------|---------|
| Escopo de tenant | Categorias, autores e seções = **globais** (sem `school_id`) |
| Permissões catálogo | Reutilizar **`books.view \| create \| update \| delete`** |
| Criar usuário | **Escola + acervo obrigatórios**; imagem opcional |
| Entrega | **Única** (Autores → Categorias → Seções → Create User) |
| Soft-delete | `status = 0` / `a_status = '0'` / `cat_status = 0` (como legado) |

## Abordagens consideradas

| Abordagem | Descrição | Resultado |
|-----------|-----------|-----------|
| **A — Entrega única (escolhida)** | Quatro features no mesmo plano/PR lógico | Mais rápida, mesmos padrões |
| B — 4 PRs | Uma feature por PR | Revisões menores; mais overhead |
| C — API first | Backend antes da UI | Catálogo inacessível até a 2ª onda |

---

## Arquitetura

Espelhar Acervos/Livros:

```
Controller → UseCase → Policy (books.* / users.create) → JPA + storage legado
```

- Módulo `catalog`: Category, Author, HomeSection
- Módulo `users`: CreateUser
- Upload de imagens: mesma raiz `adm-libares/images` (+ thumbs) usada pelo PHP / capas
- Frontend: Berry listing + form panel; nav em Catálogo

### Fora de escopo

- Site / Jogos / OneSignal / app settings / perfil admin
- `categories.*` / `authors.*` / `home_sections.*` dedicados
- Migrar schema para `APP_DATA_MODE=core`
- Isolar categorias/autores/seções por escola

---

## Modelo de dados (legado existente)

### `tbl_category`
| Coluna | Uso API |
|--------|---------|
| `cid` | id |
| `category_name` | name |
| `category_image` | image (filename) |
| `cat_status` | status (Int / 0\|1) |

### `tbl_author`
| Coluna | Uso API |
|--------|---------|
| `author_id` | id |
| `author_name` | name |
| `author_image` | image |
| `author_description` | description (**mapear na entity — hoje ausente**) |
| `a_status` | status (String `"0"`\|`"1"`) |

### `tbl_home_section`
| Coluna | Uso API |
|--------|---------|
| `id` | id |
| `section_title` | title (único case-insensitive) |
| `section_books` | CSV de book IDs |
| `status` | status (Int) |

Vínculo dual no legado: `section_books` **e** `tbl_books.section_ids`.  
Neste design: ao salvar seção, gravar `section_books` e **alinhar** `section_ids` dos livros listados (add IDs selecionados; remover da seção os que saíram da seleção, sem apagar IDs de outras seções no CSV do livro).

### `tbl_users` (create)
Campos obrigatórios: name, email, password (hash via `PasswordEncoder`), phone, `acervo_id`, `school_id` (do `TenantContext`).  
Opcionais: `user_image`, `status` default `"1"`.  
`user_type = "Normal"`.  
Estender `UserEntity` com `password` **write-only** (nunca no `UserResponse`).

---

## APIs

### Autores — `/api/v1/authors`

| Método | Path | Permissão |
|--------|------|-----------|
| GET | `/` | `books.view` |
| GET | `/options` | `books.view` (só ativos) |
| POST | `/` | `books.create` |
| PUT | `/{id}` | `books.update` |
| DELETE | `/{id}` | `books.delete` → status inativo |
| POST | `/upload/image` | `books.create` ou `books.update` |

**Upsert:** `{ name, image?, description, status }`  
**Response:** `{ id, name, image, description, status }`

### Categorias — `/api/v1/categories`

Mesmo padrão de endpoints e permissões.  
**Upsert:** `{ name, image?, status }`  
**Response:** `{ id, name, image, status }`

### Seções home — `/api/v1/home-sections`

| Método | Path | Permissão |
|--------|------|-----------|
| GET | `/` | `books.view` |
| GET | `/options` | `books.view` (ativos) |
| POST | `/` | `books.create` |
| PUT | `/{id}` | `books.update` |
| DELETE | `/{id}` | `books.delete` → status inativo |

**Upsert:** `{ title, bookIds: Long[], status }`  
**Response:** `{ id, title, bookIds, bookCount, status }`  

No multi-select de livros: listar apenas livros acessíveis ao tenant (mesmo filtro do `ListBooks`). A entidade seção permanece global.

### Compatibilidade options

Manter `GET /api/v1/books/author-options|category-options|home-section-options` delegando aos novos use cases / options, para o form de livros não quebrar.

### Usuários — `POST /api/v1/users`

Permissão: `users.create`

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "userImage": "string|null",
  "acervoId": 1,
  "status": "1"
}
```

Regras:

1. `schoolId = TenantContext.effectiveSchoolId()` — se null → `400` (Master deve enviar `X-School-Context`)
2. Acervo deve existir, estar ativo e `acervo.schoolId == schoolId`
3. Email único (case-insensitive) entre não deletados
4. Response = `UserResponse` existente (sem password)

Policy: adicionar `UserPolicy.requireCreate()` → `users.create`.

---

## Frontend

| Rota | Ação |
|------|------|
| `/autores` | Evoluir de read-only para CRUD Berry (form: nome, imagem, descrição, status) |
| `/categorias` | Nova página listing + form |
| `/secoes` | Nova página + multi-select de livros (tenant) |
| `/usuarios` | Botão/modal criar com gates `users.create` |

Nav (`navigation.ts`): itens Categorias e Seções no grupo Catálogo, permissão `books.view`.

Master sem escola no create user / create seção com livros: banner “selecione a escola” (padrão Roles/Acervos).

Descrição de autor: textarea (HTML sanitizado se já houver utilitário; sem introduzir CKEditor nesta entrega).

---

## Erros

| Caso | HTTP |
|------|------|
| Validação / email duplicado / título seção duplicado | 400 |
| Acervo outra escola / sem contexto escola | 400 ou 403 |
| Sem permissão | 403 |
| Não encontrado | 404 |
| Arquivo de imagem inválido | 400 |

Delete sempre soft (status inativo), alinhado ao PHP nas listagens com toggle.

---

## Testes

1. **IT Authors/Categories/HomeSections:** CRUD com admin que tenha `books.*`; options só ativos; DELETE deixa status inativo.
2. **IT CreateUser:** sucesso com escola+acervo; falha acervo outra escola; falha email duplicado; falha Master sem `X-School-Context`.
3. Smoke FE: rotas no menu + PermissionGate (opcional se CI FE limitado).

---

## Ordem de implementação sugerida

1. Storage genérico de imagem de catálogo (reuso legado)
2. AuthorEntity + Author CRUD + FE Autores
3. Category CRUD + FE Categorias + wire options
4. HomeSection CRUD + sync `section_ids` + FE Seções
5. CreateUser (entity password + API + modal Usuários)
6. Testes IT + ajuste nav/router

---

## Critérios de aceite

- [x] Admin com `books.*` gerencia categorias, autores e seções sem abrir o PHP
- [x] Form de livros continua preenchendo options (endpoints novos ou alias)
- [x] Admin com `users.create` cria leitor com escola do contexto e acervo válido
- [x] Catálogo global; usuários isolados por tenant
- [x] Soft-delete não remove linhas fisicamente

### Gaps conhecidos (pós-implementação)

- Login do leitor no PHP ainda compara senha em plaintext (`user_login_api.php`); create no painel grava BCrypt — incompatível até o PHP usar `password_verify`.
- Soft-delete de seção não remove o id do CSV `section_ids` nos livros (só `status = 0` na seção).
- WIP Berry / redesign FE não relacionado permanece fora deste escopo.
