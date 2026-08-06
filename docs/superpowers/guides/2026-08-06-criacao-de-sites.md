# Guia — Criação de Sites (conteúdo do módulo Site)

**Data:** 2026-08-06  
**Status:** vigente (módulo implementado)  
**Spec de domínio:** [`docs/superpowers/specs/2026-07-23-site-module-design.md`](../specs/2026-07-23-site-module-design.md)  
**Plano:** [`docs/superpowers/plans/2026-07-23-site-module.md`](../plans/2026-07-23-site-module.md)

Este guia cobre **como cadastrar um Site** (item de conteúdo do catálogo Site — tabela `Sites`), no painel admin e via API.

> **Nota:** “Site” aqui é o **conteúdo** (título, capa, arquivo), não a criação de um website/tenant. Tenant escolar **não** se aplica — o módulo é **global**.

---

## 1. Pré-requisitos

Antes de criar um Site:

| Recurso | Tela | API | Permissão |
|---------|------|-----|-----------|
| Autor ativo | `/sites/autores` | `POST /api/v1/site-authors` | `sites.create` / `sites.update` |
| Categoria ativa | `/sites/categorias` | `POST /api/v1/site-categories` | `sites.create` / `sites.update` |

Sem pelo menos **1 categoria** e **1 autor**, o formulário de Site não fecha o create.

**Permissão para criar Site:** `sites.create`  
**Menu / listagem:** `sites.view`

Role **PROFESSOR** tem só `sites.view` + `sites.toggle_status` — **não** cria Sites.

---

## 2. Fluxo no painel (`frontend-admin`)

1. Abrir **Site → Sites** (`/sites`).
2. Clicar **Novo** (abre `SiteFormModal`).
3. Preencher o formulário (`SitesForm`):
   - **Categorias** — marcar ≥1
   - **Autor** — selecionar
   - **Título** e **Descrição**
   - **Capa** — upload de imagem (obrigatório no create)
   - **Tipo de arquivo**
     - `server_url` → informar URL
     - `local` → upload do arquivo (PDF etc.)
   - **Destaque** (`featured`) e **Status** (`1` ativo / `0` inativo)
4. Salvar → `POST /api/v1/sites` → toast de sucesso + lista atualizada.

Componentes: `SitesPage` → `SiteFormModal` → `SitesForm`  
Service: `frontend-admin/src/services/sitesService.ts` (`createSite`, `uploadSiteCover`, `uploadSiteFile`).

---

## 3. API — criar Site

### Upload (antes ou durante o form)

| Endpoint | Body | Resposta | Uso |
|----------|------|----------|-----|
| `POST /api/v1/sites/upload/cover` | `multipart/form-data` campo `file` | `{ "filename": "..." }` | Preenche `coverImage` |
| `POST /api/v1/sites/upload/file` | `multipart/form-data` campo `file` | `{ "filename", "fileUrl" }` | Preenche `fileUrl` (tipo `local`) |

Auth: JWT admin + `sites.create` **ou** `sites.update`.

### Create

```http
POST /api/v1/sites
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Body (`UpsertSiteRequest`):**

```json
{
  "categoryIds": [1, 2],
  "authorId": 10,
  "title": "Guia de Leitura 2026",
  "description": "Sinopse do conteudo",
  "coverImage": "capa123.jpg",
  "fileType": "server_url",
  "fileUrl": "https://exemplo.com/arquivo.pdf",
  "featured": "0",
  "status": "1"
}
```

| Campo | Obrigatório (create) | Regras |
|-------|----------------------|--------|
| `categoryIds` | sim | lista ≥1 |
| `authorId` | sim | `> 0` |
| `title` | sim | não vazio (max 255) |
| `description` | sim | não vazio |
| `coverImage` | sim | nome do arquivo no storage legado |
| `fileType` | sim | `server_url` ou `local` |
| `fileUrl` | sim no create | URL (server_url) ou path pós-upload (local) |
| `featured` | não (default `"0"`) | `"0"` \| `"1"` |
| `status` | não (default `"1"`) | `"0"` \| `"1"` |

**Resposta:** `201` + `SiteResponse` (`id`, campos acima, `totalRate`, `rateAvg`, `views`).

**Erros comuns:** `400` validação (capa, categorias, URL, tipo); `401`/`403` auth/RBAC.

### Exemplo mínimo (`server_url`)

```json
{
  "categoryIds": [1],
  "authorId": 10,
  "title": "Meu Site",
  "description": "Descricao",
  "coverImage": "capa.jpg",
  "fileType": "server_url",
  "fileUrl": "https://cdn.exemplo.com/doc.pdf",
  "featured": "0",
  "status": "1"
}
```

### Exemplo (`local` após upload)

1. `POST /api/v1/sites/upload/cover` → `filename`  
2. `POST /api/v1/sites/upload/file` → `fileUrl`  
3. `POST /api/v1/sites` com `fileType: "local"` e esses valores.

---

## 4. Persistência

- Tabela legado: **`Sites`**
- Campos principais: `cat_id` (CSV), `aid`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `featured`, `status`, ratings/views
- Assets: storage legado (`images/`, `uploads/`) via `/legacy/assets`
- **Sem** `school_id` / acervo

---

## 5. Relacionados (não são “criar Site”)

| Ação | Rota UI | Endpoint |
|------|---------|----------|
| Criar autor | `/sites/autores` | `POST /api/v1/site-authors` |
| Criar categoria | `/sites/categorias` | `POST /api/v1/site-categories` |
| Criar seção (agrupa Sites) | `/sites/secoes` | `POST /api/v1/site-sections` |
| Editar Site | modal na listagem | `PUT /api/v1/sites/{id}` |
| Ativar/desativar | linha / detalhe | `PATCH /api/v1/sites/{id}/status` |

App leitor (Flutter Site) consome espelho legado `GET/POST /api_sites.php?method_name=...` (envelope **Galileu**), não o REST admin.

---

## 6. Checklist rápido

- [ ] Autor e categoria cadastrados
- [ ] Usuário com `sites.create`
- [ ] Capa enviada (`upload/cover`)
- [ ] Arquivo/URL definido (`server_url` ou `upload/file`)
- [ ] `POST /api/v1/sites` → `201`
- [ ] Item aparece em `/sites` e (se status ativo) no espelho leitor
