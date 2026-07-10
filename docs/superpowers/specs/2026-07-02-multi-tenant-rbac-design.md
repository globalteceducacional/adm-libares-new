# Multi-tenant (escolas) + RBAC — design

**Data:** 2026-07-02  
**Status:** Aprovado (2026-07-02)  
**Escopo:** Backend Kotlin (Spring), admin React, MySQL legado (`APP_DATA_MODE=legacy`)  
**Substitui/estende:** `2026-06-16-acervos-design.md` (seção “Acervo = escola sem entidade separada”)

## Decisão de produto (confirmada)

- **Escola** é o tenant (`school_id`).
- **Uma escola possui N acervos** (bibliotecas digitais dentro da mesma escola).
- **Livro** continua N:N com acervos, mas **somente entre acervos da mesma escola**.
- **Usuário do app** (`tbl_users`) pertence a **uma escola**; pode ter acervo padrão opcional dentro da escola.
- **Usuário do painel** (`app_admin_users`) pertence a **uma escola** ou é **Super Admin global** (`school_id IS NULL`).

---

## Problema

O painel admin autentica todos em `tbl_admin` com papel único `ADMIN`, sem isolamento por escola/acervo e sem permissões granulares. Qualquer admin vê e altera dados de todas as escolas.

---

## Objetivos

1. Isolamento forte por `school_id` (exceto Super Admin).
2. RBAC granular (`books.create`, `users.update`, etc.) — sem perfis fixos no código.
3. Autorização centralizada no backend; frontend espelha permissões só para UX.
4. Escalável para centenas/milhares de escolas sem mudança estrutural.
5. Compatível com schema legado (`acervos`, `livros_acervos`, `tbl_users`, `tbl_books`).

---

## Modelo de domínio

```
app_schools (tenant)
    │
    ├── 1..N acervos
    ├── 1..N app_admin_users (painel)
    ├── 1..N app_roles (por escola)
    ├── 1..N tbl_users (app)
    └── 0..N tbl_books (se livros forem por escola; ver nota abaixo)

acervos ──N:N── tbl_books (via livros_acervos)
```

### Nota sobre livros

- **Fase 1:** livro sem `school_id` direto; escola inferida pelos acervos vinculados.
- **Regra:** ao vincular livro a acervos, todos os `acervo_id` devem ter o **mesmo** `school_id`.
- **Fase 2 (recomendada):** coluna `tbl_books.school_id` para consultas e enforcement mais simples.

### Usuário final vs admin

| Tipo | Tabela | Escopo |
|------|--------|--------|
| Super Admin | `app_admin_users` | Global (`school_id NULL`, `is_super_admin=1`) |
| Admin da escola | `app_admin_users` | Uma escola |
| Usuário do painel (granular) | `app_admin_users` | Uma escola + roles customizadas |
| Leitor/aluno (app) | `tbl_users` | Uma escola (`school_id`); `acervo_id` opcional como acervo padrão |

---

## Banco de dados

### Novas tabelas (`app_*`)

```sql
CREATE TABLE app_schools (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  slug         VARCHAR(80) NOT NULL UNIQUE,
  status       VARCHAR(1) NOT NULL DEFAULT '1',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE app_permissions (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(80) NOT NULL UNIQUE,  -- books.create
  module       VARCHAR(50) NOT NULL,
  description  VARCHAR(255) NOT NULL
);

CREATE TABLE app_roles (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  school_id    BIGINT NULL,                   -- NULL = role global (Super Admin)
  name         VARCHAR(100) NOT NULL,
  is_system    TINYINT(1) NOT NULL DEFAULT 0,
  status       VARCHAR(1) NOT NULL DEFAULT '1',
  UNIQUE KEY uk_role_school_name (school_id, name),
  CONSTRAINT fk_role_school FOREIGN KEY (school_id) REFERENCES app_schools(id)
);

CREATE TABLE app_role_permissions (
  role_id         BIGINT NOT NULL,
  permission_id   BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES app_roles(id),
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES app_permissions(id)
);

CREATE TABLE app_admin_users (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  school_id       BIGINT NULL,
  username        VARCHAR(100) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(150) NOT NULL,
  status          VARCHAR(1) NOT NULL DEFAULT '1',
  is_super_admin  TINYINT(1) NOT NULL DEFAULT 0,
  perm_version    INT NOT NULL DEFAULT 1,     -- invalida JWT ao alterar roles
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_school FOREIGN KEY (school_id) REFERENCES app_schools(id),
  CONSTRAINT chk_super_school CHECK (
    (is_super_admin = 1 AND school_id IS NULL) OR (is_super_admin = 0 AND school_id IS NOT NULL)
  )
);

CREATE TABLE app_admin_user_roles (
  admin_user_id BIGINT NOT NULL,
  role_id       BIGINT NOT NULL,
  PRIMARY KEY (admin_user_id, role_id),
  CONSTRAINT fk_aur_user FOREIGN KEY (admin_user_id) REFERENCES app_admin_users(id),
  CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES app_roles(id)
);
```

### Alterações em tabelas legadas

```sql
ALTER TABLE acervos
  ADD COLUMN school_id BIGINT NULL,
  ADD INDEX idx_acervos_school (school_id),
  ADD CONSTRAINT fk_acervos_school FOREIGN KEY (school_id) REFERENCES app_schools(id);

ALTER TABLE tbl_users
  ADD COLUMN school_id BIGINT NULL,
  ADD INDEX idx_users_school (school_id),
  ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES app_schools(id);

-- Fase 2
-- ALTER TABLE tbl_books ADD COLUMN school_id BIGINT NULL, ...
```

### Migração de dados (Flyway V9+)

1. Para cada `acervos` existente: criar `app_schools` (nome = `acervos.nome` ou nome derivado).
2. Preencher `acervos.school_id` (inicialmente 1 escola : 1 acervo do dump; escolas futuras podem ter vários).
3. Preencher `tbl_users.school_id` a partir de `tbl_users.acervo_id → acervos.school_id`.
4. Migrar `tbl_admin` → `app_admin_users` (primeiro admin = Super Admin seed).
5. Seed `app_permissions` + roles sistema (`SUPER_ADMIN`, `SCHOOL_ADMIN`).

---

## Catálogo de permissões (seed inicial)

| Módulo | Códigos |
|--------|---------|
| schools | `schools.view`, `schools.create`, `schools.update`, `schools.delete` |
| acervos | `acervos.view`, `acervos.create`, `acervos.update`, `acervos.delete` |
| users | `users.view`, `users.create`, `users.update`, `users.delete`, `users.block` |
| roles | `roles.view`, `roles.create`, `roles.update`, `roles.delete` |
| books | `books.view`, `books.create`, `books.update`, `books.delete` |
| loans | `loans.view`, `loans.create`, `loans.return` |
| people | `students.manage`, `teachers.manage` |
| reports | `reports.view` |
| settings | `settings.school` |
| platform | `platform.impersonate` (super admin atuar no contexto de uma escola) |

### Roles sistema

| Role | `school_id` | Permissões |
|------|-------------|------------|
| `SUPER_ADMIN` | `NULL` | Todas + bypass tenant |
| `SCHOOL_ADMIN` | por escola | Pacote amplo da escola (exceto `schools.*`, `platform.*`) |
| Custom | por escola | Definidas pelo admin da escola |

---

## Backend — arquitetura

### Componentes

| Componente | Responsabilidade |
|------------|------------------|
| `JwtAuthenticationFilter` | Valida token, monta `AdminPrincipal` |
| `TenantContext` | `schoolId`, `isSuperAdmin`, `activeSchoolId` (impersonação) |
| `AuthorizationService` | `check(perm)`, `can(perm)`, `assertSameSchool(id)` |
| `TenantSqlGuard` | Injeta `school_id` em queries nativas |
| `*Policy` | Regras por agregado (`BookPolicy`, `UserPolicy`, `AcervoPolicy`) |
| Use cases | Chamam Policy + Authorization; **nunca** `if (role == ...)` |

### `AdminPrincipal`

```kotlin
data class AdminPrincipal(
  val userId: Long,
  val username: String,
  val schoolId: Long?,           // escola do usuário (null se super)
  val isSuperAdmin: Boolean,
  val permissions: Set<String>,
  val permVersion: Int
)
```

### JWT (claims)

```json
{
  "sub": "admin.escola1",
  "uid": 42,
  "schoolId": 5,
  "super": false,
  "pv": 3,
  "perms": ["books.view", "books.create", "acervos.view"]
}
```

- TTL: 60 min (atual) ou access 15 min + refresh token (fase 2).
- Ao alterar roles: incrementar `perm_version` → tokens antigos rejeitados.

### Tenant — regras

| Actor | Filtro em consultas | Pode ver outras escolas? |
|-------|-------------------|--------------------------|
| Super Admin | Nenhum (ou `X-School-Context` opcional) | Sim |
| Admin/usuário escola | `WHERE school_id = :ctx` | Não |

**Acervos (N por escola):**

- Listagem: `acervos.school_id = TenantContext.effectiveSchoolId()`.
- Criar acervo: força `school_id` do contexto; exige `acervos.create`.
- Livro em múltiplos acervos: validar que todos os acervos ∈ mesma escola do actor.

**Super Admin com contexto de escola:**

- Header opcional: `X-School-Context: {schoolId}` quando `super=true` e `platform.impersonate`.
- Sem header: visão global (listar escolas, todos os dados).

### Enforcement em SQL nativo (padrão atual do projeto)

```sql
-- TenantSqlGuard.apply(sql, params)
AND (:tenantSchoolId IS NULL OR a.school_id = :tenantSchoolId)
```

`:tenantSchoolId` = `NULL` apenas para Super Admin sem impersonação.

### Exemplo — `SyncBookAcervosUseCase`

1. `authorization.check("books.update")`
2. Carregar acervos por IDs.
3. `assertAll { acervo.schoolId == tenant.effectiveSchoolId() }`
4. Se Super Admin global editando livro legado sem escola: bloquear ou exigir contexto.

---

## Frontend — arquitetura

### Auth

- `GET /api/v1/auth/me` → perfil + `school` + `permissions` + `isSuperAdmin`.
- `usePermission("books.create")` → boolean.
- `PermissionGate` em rotas e botões.
- Navegação (`navigation.ts`): trocar `NavRole` fixo por `requiredPermission`.

### UX multi-acervo

- Filtro de acervo na listagem de livros: **somente acervos da escola do usuário**.
- Super Admin: seletor de escola no topo (contexto) + filtro de acervo dentro da escola.
- Cadastro de livro: multi-select de acervos **da mesma escola**.

### Rotas protegidas

```
/schools          → schools.view (super)
/acervos          → acervos.view
/books            → books.view
/users            → users.view
/settings/roles   → roles.view
```

---

## Fluxos

### 1. Bootstrap plataforma

```
Super Admin → cria Escola → cria 1+ Acervos → cria Admin da Escola (role SCHOOL_ADMIN)
```

### 2. Admin da escola

```
Login → TenantContext(schoolId) → cria Roles → cria Usuários do painel → atribui permissões
```

### 3. Usuário com permissões parciais

```
Login → menu e APIs filtrados por permissions ∩ school_id
```

---

## Segurança (não negociável)

1. `school_id` do body/query **ignorado** para usuários não-super; sempre do `TenantContext`.
2. IDOR: todo `findById` escopado por escola.
3. Roles: admin da escola só atribui `app_roles` com `school_id` igual ao dele.
4. Cross-school em `livros_acervos`: rejeitar se acervos de escolas diferentes.
5. Testes de integração: usuário escola A **não** acessa recurso escola B.
6. Auditoria: `actor_id`, `school_id`, `permission`, `resource`.

---

## Fases de implementação

| Fase | Entrega |
|------|---------|
| **0** | Flyway: `app_*`, `acervos.school_id`, `tbl_users.school_id`, seeds, migração acervos→schools |
| **1** | `app_admin_users`, login novo, JWT + `/auth/me`, `AuthorizationService` |
| **2** | Tenant em leituras (books, users, acervos) |
| **3** | Tenant + RBAC em escritas; `*Policy` |
| **4** | Frontend: `usePermission`, guards, seletor escola (super) |
| **5** | UI gestão: escolas (super), roles (admin escola) |
| **6** | Deprecar `tbl_admin` + `ROLE_ADMIN` fixo; remover MD5 |

---

## Impacto no spec de acervos (2026-06-16)

| Antes | Depois |
|-------|--------|
| Acervo = escola | Escola é tenant; acervo é filho (N por escola) |
| Admin global | Admin escopado por `school_id` |
| Filtro `?acervoId=` opcional | Filtro acervo **dentro** da escola; tenant obrigatório no backend |
| `tbl_users.acervo_id` | Manter + `school_id`; acervo = preferência dentro da escola |

---

## Fora de escopo (v1)

- App mobile (leitores): apenas garantir que APIs existentes respeitem escola quando expostas.
- Empréstimos/alunos/professores: permissões seedadas; módulos implementados depois.
- Postgres / `APP_DATA_MODE=core`: mesmo modelo lógico, tabelas `app_*` reutilizáveis.

---

## Aprovação

Após aprovação deste spec:

1. Invocar skill `writing-plans` para plano de implementação por fase.
2. Implementar Fase 0 + 1 antes de qualquer UI de gestão de roles.
