# Multi-tenant (escolas) + RBAC — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isolar dados por escola (`school_id`), com N acervos por escola, RBAC granular no painel admin e enforcement centralizado no backend Kotlin + guards no React.

**Architecture:** Tenant raiz = `app_schools`; acervos filhos com `acervos.school_id`; identidade do painel em `app_admin_users` + `app_roles` + `app_permissions`; `TenantContext` + `AuthorizationService` + `TenantSqlGuard` em todos os use cases; JWT com `schoolId`, `perms`, `permVersion`.

**Tech Stack:** Kotlin 1.9 / Spring Boot 3.3 / JPA + Flyway / MySQL legado / JWT (jjwt 0.12) / React admin (Vite + TanStack Query)

**Spec:** `docs/superpowers/specs/2026-07-02-multi-tenant-rbac-design.md`

**Pré-requisitos locais:** MySQL `adm_libare`, junction `C:\Users\User\Repository\adm-projeto`, credenciais em `scripts/local/dev.local.ps1`.

---

## Mapa de arquivos (visão geral)

| Área | Criar | Modificar |
|------|-------|-----------|
| DB | `V9__multi_tenant_schema.sql`, `V10__multi_tenant_seed.sql` | — |
| Tenant/RBAC core | `shared/tenant/*`, `shared/security/AdminPrincipal.kt`, `modules/rbac/*`, `modules/schools/*` | `SecurityConfig.kt`, `JwtService.kt`, `JwtAuthenticationFilter.kt` |
| Auth | `GetCurrentUserUseCase.kt`, `AuthMeResponse.kt` | `LoginUseCase.kt`, `AuthController.kt`, `LoginResponse.kt` |
| Catalog | `AcervoPolicy.kt`, `BookPolicy.kt` | `AcervoEntity.kt`, `AcervoCrudUseCases.kt`, `SyncBookAcervosUseCase.kt`, `ListBooksUseCase.kt`, `UserEntity.kt`, use cases users |
| Frontend | `features/auth/*`, `features/tenant/*`, `SchoolsPage.tsx`, `RolesPage.tsx` | `navigation.ts`, `router.tsx`, `LoginPage.tsx`, `api.ts`, páginas existentes |
| Testes | `backend/src/test/kotlin/.../TenantIsolationIT.kt`, `AuthorizationServiceTest.kt` | `build.gradle.kts` (se precisar H2/testcontainers) |

---

## Fase 0 — Schema e migração de dados

### Task 0.1: Migration `app_schools` e RBAC

**Files:**
- Create: `backend/src/main/resources/db/migration/V9__multi_tenant_schema.sql`

- [ ] **Step 1: Criar migration com tabelas `app_*`**

```sql
-- V9__multi_tenant_schema.sql (trecho principal)
CREATE TABLE app_schools (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  status VARCHAR(1) NOT NULL DEFAULT '1',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_school_slug (slug)
);

CREATE TABLE app_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  UNIQUE KEY uk_permission_code (code)
);

CREATE TABLE app_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT NULL,
  name VARCHAR(100) NOT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(1) NOT NULL DEFAULT '1',
  UNIQUE KEY uk_role_school_name (school_id, name),
  CONSTRAINT fk_role_school FOREIGN KEY (school_id) REFERENCES app_schools(id)
);

CREATE TABLE app_role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES app_roles(id),
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES app_permissions(id)
);

CREATE TABLE app_admin_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  status VARCHAR(1) NOT NULL DEFAULT '1',
  is_super_admin TINYINT(1) NOT NULL DEFAULT 0,
  perm_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_username (username),
  CONSTRAINT fk_admin_school FOREIGN KEY (school_id) REFERENCES app_schools(id)
);

CREATE TABLE app_admin_user_roles (
  admin_user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (admin_user_id, role_id),
  CONSTRAINT fk_aur_user FOREIGN KEY (admin_user_id) REFERENCES app_admin_users(id),
  CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES app_roles(id)
);

ALTER TABLE acervos
  ADD COLUMN school_id BIGINT NULL,
  ADD INDEX idx_acervos_school (school_id);

ALTER TABLE tbl_users
  ADD COLUMN school_id BIGINT NULL,
  ADD INDEX idx_users_school (school_id);
```

- [ ] **Step 2: Rodar Flyway local**

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\run-backend-junction.ps1" -Task bootRun
```

Expected: log `Successfully validated` incluindo migration V9; app sobe sem erro Hibernate.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V9__multi_tenant_schema.sql
git commit -m "feat(db): add multi-tenant schools and RBAC schema"
```

---

### Task 0.2: Seed permissions, roles e migração acervos → schools

**Files:**
- Create: `backend/src/main/resources/db/migration/V10__multi_tenant_seed.sql`

- [ ] **Step 1: Seed permissões (lista completa do spec)**

Inserir todos os códigos: `schools.view`, `schools.create`, `schools.update`, `schools.delete`, `acervos.view`, `acervos.create`, `acervos.update`, `acervos.delete`, `users.view`, `users.create`, `users.update`, `users.delete`, `users.block`, `roles.view`, `roles.create`, `roles.update`, `roles.delete`, `books.view`, `books.create`, `books.update`, `books.delete`, `loans.view`, `loans.create`, `loans.return`, `students.manage`, `teachers.manage`, `reports.view`, `settings.school`, `platform.impersonate`.

- [ ] **Step 2: Migrar acervos existentes**

```sql
-- Para cada acervo ativo, criar escola e vincular
INSERT INTO app_schools (name, slug, status)
SELECT nome, CONCAT('escola-', id), IF(status = 1, '1', '0')
FROM acervos;

UPDATE acervos a
JOIN app_schools s ON s.slug = CONCAT('escola-', a.id)
SET a.school_id = s.id;

UPDATE tbl_users u
JOIN acervos a ON a.id = u.acervo_id
SET u.school_id = a.school_id
WHERE u.acervo_id IS NOT NULL;
```

- [ ] **Step 3: Criar role SUPER_ADMIN global + migrar tbl_admin**

```sql
INSERT INTO app_roles (school_id, name, is_system, status)
VALUES (NULL, 'SUPER_ADMIN', 1, '1');

-- Vincular TODAS as permissions à SUPER_ADMIN
INSERT INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r CROSS JOIN app_permissions p WHERE r.name = 'SUPER_ADMIN';

-- Migrar admins legados (exemplo: primeiro vira super, demais exigem escola manual na v1)
INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
SELECT NULL, username, password, COALESCE(name, username), '1', 1
FROM tbl_admin LIMIT 1;
-- Ajustar conforme dados reais; manter tbl_admin até Fase 6
```

- [ ] **Step 4: Adicionar FKs após backfill**

```sql
ALTER TABLE acervos
  ADD CONSTRAINT fk_acervos_school FOREIGN KEY (school_id) REFERENCES app_schools(id);

ALTER TABLE tbl_users
  ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES app_schools(id);
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V10__multi_tenant_seed.sql
git commit -m "feat(db): seed RBAC permissions and migrate acervos to schools"
```

---

### Task 0.3: Entidades JPA e repositórios base

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/schools/infrastructure/persistence/entity/SchoolEntity.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/infrastructure/persistence/entity/{PermissionEntity,RoleEntity,AdminUserEntityV2}.kt`
- Create: repositórios em `modules/schools/...` e `modules/rbac/...`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/catalog/infrastructure/persistence/entity/AcervoEntity.kt` — campo `schoolId: Long?`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/users/infrastructure/persistence/entity/UserEntity.kt` — campo `schoolId: Long?`
- Modify: `backend/src/main/kotlin/com/libare/adm/shared/config/DataModeStartupValidator.kt` — incluir `app_schools` na validação se aplicável

- [ ] **Step 1: AcervoEntity com schoolId**

```kotlin
@Column(name = "school_id")
val schoolId: Long? = null,
```

- [ ] **Step 2: Compilar**

```powershell
cd C:\Users\User\Repository\adm-projeto\backend ; .\gradlew.bat compileKotlin --no-daemon
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add JPA entities for schools and RBAC"
```

---

## Fase 1 — Auth, JWT e AuthorizationService

### Task 1.1: AdminPrincipal e TenantContext

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/shared/security/AdminPrincipal.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/shared/tenant/TenantContext.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/shared/tenant/TenantContextFilter.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/shared/tenant/TenantSchoolResolver.kt` — lê `X-School-Context` se super admin

- [ ] **Step 1: Implementar AdminPrincipal**

```kotlin
data class AdminPrincipal(
    val userId: Long,
    val username: String,
    val schoolId: Long?,
    val isSuperAdmin: Boolean,
    val permissions: Set<String>,
    val permVersion: Int,
    val impersonatedSchoolId: Long? = null
) {
    fun effectiveSchoolId(): Long? =
        when {
            isSuperAdmin -> impersonatedSchoolId
            else -> schoolId
        }
}
```

- [ ] **Step 2: TenantContext holder thread-local**

```kotlin
object TenantContext {
    private val holder = ThreadLocal<AdminPrincipal?>()

    fun set(principal: AdminPrincipal) { holder.set(principal) }
    fun get(): AdminPrincipal = holder.get() ?: error("Tenant context not set")
    fun getOrNull(): AdminPrincipal? = holder.get()
    fun clear() { holder.remove() }

    fun effectiveSchoolId(): Long? = getOrNull()?.effectiveSchoolId()
    fun isSuperAdmin(): Boolean = getOrNull()?.isSuperAdmin == true
}
```

- [ ] **Step 3: Filter após JWT — parse header escola**

Registrar `TenantContextFilter` depois de `JwtAuthenticationFilter` em `SecurityConfig`.

- [ ] **Step 4: Commit**

---

### Task 1.2: JwtService com claims RBAC

**Files:**
- Modify: `backend/src/main/kotlin/com/libare/adm/shared/security/JwtService.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/shared/security/JwtAuthenticationFilter.kt`

- [ ] **Step 1: Estender generateToken**

```kotlin
fun generateAdminToken(principal: AdminPrincipal): String {
    val now = Instant.now()
    val expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES)
    return Jwts.builder()
        .subject(principal.username)
        .claim("uid", principal.userId)
        .claim("schoolId", principal.schoolId)
        .claim("super", principal.isSuperAdmin)
        .claim("pv", principal.permVersion)
        .claim("perms", principal.permissions.toList())
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiresAt))
        .signWith(signingKey)
        .compact()
}
```

- [ ] **Step 2: JwtAuthenticationFilter monta AdminPrincipal a partir dos claims**

Validar `permVersion` contra DB em requests críticos (ou em todo request via cache curto).

- [ ] **Step 3: Commit**

---

### Task 1.3: LoginUseCase contra app_admin_users

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/application/ResolveAdminPermissionsUseCase.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/auth/application/LoginUseCase.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/auth/api/dto/LoginResponse.kt`

- [ ] **Step 1: Login busca `app_admin_users` + roles + permissions**

```kotlin
val admin = appAdminUserRepository.findByUsername(request.username)
    .orElseThrow { UnauthorizedException("Credenciais invalidas") }
if (admin.status != "1") throw UnauthorizedException("Usuario inativo")
// validar senha BCrypt (manter fallback MD5 só para migração Fase 6)
val permissions = resolveAdminPermissionsUseCase.execute(admin.id)
val principal = AdminPrincipal(
    userId = admin.id,
    username = admin.username,
    schoolId = admin.schoolId,
    isSuperAdmin = admin.isSuperAdmin,
    permissions = permissions,
    permVersion = admin.permVersion
)
val jwt = jwtService.generateAdminToken(principal)
```

- [ ] **Step 2: LoginResponse inclui permissions e school**

```kotlin
data class LoginResponse(
    val accessToken: String,
    val expiresInSeconds: Long,
    val isSuperAdmin: Boolean,
    val schoolId: Long?,
    val permissions: List<String>
)
```

- [ ] **Step 3: Teste manual**

```powershell
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"teste.admin\",\"password\":\"Admin@123\"}"
```

Expected: JSON com `permissions` não vazio.

- [ ] **Step 4: Commit**

---

### Task 1.4: GET /auth/me e AuthorizationService

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/auth/application/GetCurrentUserUseCase.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/auth/api/dto/AuthMeResponse.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/shared/security/AuthorizationService.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/auth/api/AuthController.kt`

- [ ] **Step 1: AuthorizationService**

```kotlin
@Service
class AuthorizationService {
    fun can(permission: String): Boolean {
        val p = TenantContext.getOrNull() ?: return false
        if (p.isSuperAdmin) return true
        return permission in p.permissions
    }

    fun check(permission: String) {
        if (!can(permission)) throw ForbiddenException("Permissao negada: $permission")
    }

    fun assertSameSchool(targetSchoolId: Long?) {
        val p = TenantContext.get()
        if (p.isSuperAdmin && p.impersonatedSchoolId == null) return
        val effective = p.effectiveSchoolId()
        if (effective == null || targetSchoolId == null || effective != targetSchoolId) {
            throw ForbiddenException("Acesso negado a recurso de outra escola")
        }
    }
}
```

- [ ] **Step 2: GET /api/v1/auth/me**

Retorna nome, escola `{id,name}`, `isSuperAdmin`, `permissions`, `permVersion`.

- [ ] **Step 3: SecurityConfig — trocar hasRole("ADMIN") por authenticated**

```kotlin
it.anyRequest().authenticated()
```

Permissões finas ficam nos use cases via `AuthorizationService`.

- [ ] **Step 4: Commit**

---

### Task 1.5: Teste de integração auth

**Files:**
- Create: `backend/src/test/kotlin/com/libare/adm/auth/AuthRbacIT.kt`

- [ ] **Step 1: Teste login retorna permissions**

```kotlin
@SpringBootTest
@AutoConfigureMockMvc
class AuthRbacIT {
    @Autowired lateinit var mockMvc: MockMvc

    @Test
    fun `super admin login returns platform permissions`() {
        val body = """{"username":"teste.admin","password":"Admin@123"}"""
        mockMvc.post("/api/v1/auth/login") { contentType = MediaType.APPLICATION_JSON; content = body }
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.permissions").isArray)
    }
}
```

- [ ] **Step 2: Rodar**

```powershell
cd C:\Users\User\Repository\adm-projeto\backend ; .\gradlew.bat test --tests "com.libare.adm.auth.AuthRbacIT" --no-daemon
```

- [ ] **Step 3: Commit**

---

## Fase 2 — Tenant em leituras

### Task 2.1: TenantSqlGuard

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/shared/tenant/TenantSqlGuard.kt`

- [ ] **Step 1: Helper para parâmetro tenant**

```kotlin
object TenantSqlGuard {
    fun tenantSchoolIdParam(): Long? {
        val ctx = TenantContext.getOrNull() ?: return null
        if (ctx.isSuperAdmin && ctx.impersonatedSchoolId == null) return null
        return ctx.effectiveSchoolId()
    }

    const val ACERVO_SCHOOL_FILTER = "AND (:tenantSchoolId IS NULL OR a.school_id = :tenantSchoolId)"
}
```

- [ ] **Step 2: Commit**

---

### Task 2.2: Listagens acervos, livros, usuários

**Files:**
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/catalog/application/AcervoCrudUseCases.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/catalog/application/ListBooksUseCase.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/catalog/infrastructure/persistence/repository/AcervoJpaRepository.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/users/application/ListUsersUseCase.kt` (ou equivalente)

- [ ] **Step 1: Acervos — filtrar por school_id**

`ListAcervosUseCase`: `authorization.check("acervos.view")` + query `WHERE school_id = :tenant OR :tenant IS NULL`.

- [ ] **Step 2: Livros — join acervos com filtro escola**

Em `BookJpaRepository.findAllWithAuthorName`, adicionar join/filtro para livros que tenham ao menos um acervo da escola efetiva.

- [ ] **Step 3: Usuários — filtrar tbl_users.school_id**

- [ ] **Step 4: Teste IDOR**

Create: `backend/src/test/kotlin/com/libare/adm/tenant/TenantIsolationIT.kt` — admin escola A não lista usuários escola B.

- [ ] **Step 5: Commit**

---

## Fase 3 — Tenant + RBAC em escritas

### Task 3.1: Policies

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/catalog/application/policy/AcervoPolicy.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/catalog/application/policy/BookPolicy.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/users/application/policy/UserPolicy.kt`

- [ ] **Step 1: AcervoPolicy — create força schoolId do tenant**

```kotlin
@Component
class AcervoPolicy(private val auth: AuthorizationService) {
    fun requireCreate() = auth.check("acervos.create")
    fun resolveSchoolIdForCreate(): Long {
        auth.check("acervos.create")
        val schoolId = TenantContext.get().effectiveSchoolId()
            ?: throw BadRequestException("Super admin deve informar contexto de escola")
        return schoolId
    }
}
```

- [ ] **Step 2: SyncBookAcervosUseCase — mesma escola em todos acervos**

```kotlin
val acervos = acervoRepository.findAllById(acervoIds)
val schoolIds = acervos.mapNotNull { it.schoolId }.distinct()
if (schoolIds.size != 1) throw BadRequestException("Acervos devem pertencer a mesma escola")
authorization.assertSameSchool(schoolIds.single())
```

- [ ] **Step 3: Aplicar em Create/Update/Delete de acervos, livros, usuários**

- [ ] **Step 4: Commit**

---

### Task 3.2: CRUD escolas (super admin)

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/schools/api/SchoolController.kt`
- Create: use cases `CreateSchoolUseCase`, `ListSchoolsUseCase`, etc.

- [ ] **Step 1: Endpoints `/api/v1/schools` com `schools.*` permissions**

- [ ] **Step 2: Ao criar escola, permitir criar N acervos iniciais (opcional v1: escola vazia)**

- [ ] **Step 3: Commit**

---

## Fase 4 — Frontend RBAC e contexto escola

### Task 4.1: AuthContext e usePermission

**Files:**
- Create: `frontend-admin/src/features/auth/AuthContext.tsx`
- Create: `frontend-admin/src/features/auth/usePermission.ts`
- Create: `frontend-admin/src/features/auth/PermissionGate.tsx`
- Create: `frontend-admin/src/services/authMeService.ts`
- Modify: `frontend-admin/src/ui/pages/LoginPage.tsx` — após login chamar `/auth/me` ou usar claims do response
- Modify: `frontend-admin/src/lib/auth.ts` — persistir permissions opcionalmente

- [ ] **Step 1: AuthProvider carrega `/api/v1/auth/me` no boot**

- [ ] **Step 2: usePermission('books.create')**

- [ ] **Step 3: Commit**

---

### Task 4.2: Navegação e rotas

**Files:**
- Modify: `frontend-admin/src/features/layout/config/navigation.ts`
- Modify: `frontend-admin/src/router.tsx`

- [ ] **Step 1: Trocar `roles: NavRole[]` por `permission?: string`**

```ts
{ path: "/books", label: "Livros", permission: "books.view" }
{ path: "/schools", label: "Escolas", permission: "schools.view" }
```

- [ ] **Step 2: PermissionRoute wrapper**

- [ ] **Step 3: Esconder botões Novo/Editar/Excluir sem permissão**

- [ ] **Step 4: `npm run build`**

- [ ] **Step 5: Commit**

---

### Task 4.3: Seletor de escola (Super Admin)

**Files:**
- Create: `frontend-admin/src/features/tenant/SchoolContextSwitcher.tsx`
- Modify: `frontend-admin/src/lib/api.ts` — enviar header `X-School-Context` quando selecionado

- [ ] **Step 1: Dropdown de escolas no Topbar para super admin**

- [ ] **Step 2: Filtro de acervos recarrega opções da escola selecionada**

- [ ] **Step 3: Commit**

---

## Fase 5 — UI gestão escolas e roles

### Task 5.1: SchoolsPage (super admin)

**Files:**
- Create: `frontend-admin/src/ui/pages/SchoolsPage.tsx`
- Create: `frontend-admin/src/services/schoolsService.ts`

- [ ] **Step 1: CRUD escolas + link para criar admin da escola**

- [ ] **Step 2: Commit**

---

### Task 5.2: RolesPage (admin escola)

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/api/RoleController.kt`
- Create: `frontend-admin/src/ui/pages/RolesPage.tsx`

- [ ] **Step 1: Listar/criar roles com checkboxes de permissions**

- [ ] **Step 2: Impedir edição de roles `is_system`**

- [ ] **Step 3: Commit**

---

## Fase 6 — Deprecação legado

### Task 6.1: Remover tbl_admin e MD5

**Files:**
- Modify: `LoginUseCase.kt` — só `app_admin_users`
- Create: `V11__drop_tbl_admin.sql` (após validação)

- [ ] **Step 1: Feature flag `app.auth.legacy-admin-enabled=false`**

- [ ] **Step 2: Remover fallback MD5**

- [ ] **Step 3: Commit**

---

## Ordem de execução recomendada

```
Fase 0 (Tasks 0.1–0.3) → Fase 1 (1.1–1.5) → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
```

**Checkpoint obrigatório após Fase 1:** login funcional, JWT com permissions, `/auth/me`, testes auth passando.

**Checkpoint após Fase 3:** teste IDOR escola A vs B em books/users/acervos.

---

## Self-review (spec coverage)

| Requisito spec | Task |
|----------------|------|
| school_id tenant | 0.1, 0.2, 1.1 |
| N acervos por escola | 0.2, 3.1 SyncBookAcervos |
| RBAC granular | 0.2, 1.3, 1.4 |
| Super Admin global | 0.2, 1.1 impersonation |
| JWT permVersion | 1.2, 1.3 |
| TenantSqlGuard | 2.1, 2.2 |
| Frontend guards | 4.1, 4.2 |
| CRUD escolas | 3.2, 5.1 |
| Gestão roles | 5.2 |
| Deprecar tbl_admin | 6.1 |
| tbl_books.school_id (fase 2 spec) | **Gap intencional pós-v1** — adicionar Task 3.3 se necessário |

---

## Execução

Plano salvo. Duas opções:

1. **Subagent-Driven (recomendado)** — um subagent por task, revisão entre tasks  
2. **Inline Execution** — implementar nesta sessão, Fase 0 + 1 primeiro, com checkpoints

Qual abordagem você prefere?
