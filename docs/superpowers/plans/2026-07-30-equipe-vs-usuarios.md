# Equipe vs Usuarios — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separar cadastro de leitores do app (`/usuarios`) do staff do painel (`/equipe`), com regras SUPER cria SCHOOL_ADMIN/PROFESSOR, SCHOOL_ADMIN cria so PROFESSOR, PROFESSOR nao cria ninguem.

**Architecture:** Permissoes `team.view` / `team.create`; GET+POST `/api/v1/admin-users`; policy no use case (SUPER vs nao-SUPER); pagina Equipe no frontend; copy e escola readonly em Usuarios; remover subform admin em Escolas.

**Tech Stack:** Kotlin/Spring Boot, Flyway Java migration (V19), React/Vite admin, TanStack Query

**Spec:** `docs/superpowers/specs/2026-07-30-equipe-vs-usuarios-design.md`

---

## File map

| Path | Responsibility |
|------|----------------|
| `backend/.../db/migration/V19__TeamPermissions.kt` | Insert `team.view`/`team.create`; grant SCHOOL_ADMIN (+ SUPER_ADMIN se existir) |
| `backend/.../schools/application/ProvisionSchoolRolesUseCase.kt` | Incluir grants `team.*` no provision SCHOOL_ADMIN |
| `backend/.../rbac/application/policy/TeamPolicy.kt` | `requireView` / `requireCreate` |
| `backend/.../rbac/application/TeamCreateAuthorization.kt` | Regra pura: quem pode criar qual `roleCode` |
| `backend/.../rbac/application/CreateTeamMemberUseCase.kt` | Create staff |
| `backend/.../rbac/application/ListTeamMembersUseCase.kt` | List staff |
| `backend/.../rbac/api/dto/*Team*.kt` | Request/response DTOs |
| `backend/.../rbac/api/AdminUserController.kt` | GET + POST |
| `backend/src/test/kotlin/.../TeamCreateAuthorizationTest.kt` | Unit tests da regra |
| `frontend-admin/src/types/team.ts` | Types |
| `frontend-admin/src/services/teamService.ts` | API client |
| `frontend-admin/src/features/shared/api/queries.ts` | Query keys + hooks |
| `frontend-admin/src/ui/pages/TeamPage.tsx` | List + create |
| `frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx` | Form |
| `frontend-admin/src/features/layout/config/navigation.ts` | Item Equipe |
| `frontend-admin/src/router.tsx` | Rota `/equipe` |
| `frontend-admin/src/ui/pages/UsersPage.tsx` + `CreateUserForm.tsx` | Copy + escola readonly |
| `frontend-admin/src/ui/pages/SchoolsPage.tsx` + `schoolsService.ts` | Remover create admin UI |

---

### Task 1: Unit test da autorizacao de create

**Files:**
- Create: `backend/src/test/kotlin/com/libare/adm/modules/rbac/application/TeamCreateAuthorizationTest.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/application/TeamCreateAuthorization.kt`

- [ ] **Step 1: Escrever o objeto de autorizacao + testes**

```kotlin
// TeamCreateAuthorization.kt
package com.libare.adm.modules.rbac.application

object TeamCreateAuthorization {
    const val ROLE_SCHOOL_ADMIN = "SCHOOL_ADMIN"
    const val ROLE_PROFESSOR = "PROFESSOR"

    fun allowedRoleCodes(isSuperAdmin: Boolean): Set<String> =
        if (isSuperAdmin) setOf(ROLE_SCHOOL_ADMIN, ROLE_PROFESSOR)
        else setOf(ROLE_PROFESSOR)

    fun assertCanCreate(isSuperAdmin: Boolean, roleCode: String) {
        val normalized = roleCode.trim().uppercase()
        if (normalized !in allowedRoleCodes(isSuperAdmin)) {
            throw com.libare.adm.shared.exception.ForbiddenException(
                "Perfil nao permitido para o seu usuario"
            )
        }
    }

    fun assertCanAssignSchool(
        isSuperAdmin: Boolean,
        targetSchoolId: Long,
        callerAllowedSchoolIds: Set<Long>
    ) {
        if (isSuperAdmin) return
        if (targetSchoolId !in callerAllowedSchoolIds) {
            throw com.libare.adm.shared.exception.ForbiddenException(
                "Escola nao permitida"
            )
        }
    }
}
```

```kotlin
// TeamCreateAuthorizationTest.kt
package com.libare.adm.modules.rbac.application

import com.libare.adm.shared.exception.ForbiddenException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class TeamCreateAuthorizationTest {
    @Test
    fun `super pode SCHOOL_ADMIN e PROFESSOR`() {
        assertEquals(
            setOf("SCHOOL_ADMIN", "PROFESSOR"),
            TeamCreateAuthorization.allowedRoleCodes(true)
        )
    }

    @Test
    fun `nao-super so PROFESSOR`() {
        assertEquals(setOf("PROFESSOR"), TeamCreateAuthorization.allowedRoleCodes(false))
    }

    @Test
    fun `school admin nao cria SCHOOL_ADMIN`() {
        assertThrows(ForbiddenException::class.java) {
            TeamCreateAuthorization.assertCanCreate(false, "SCHOOL_ADMIN")
        }
    }

    @Test
    fun `school admin cria PROFESSOR`() {
        TeamCreateAuthorization.assertCanCreate(false, "professor")
    }

    @Test
    fun `school admin nao atribui escola alheia`() {
        assertThrows(ForbiddenException::class.java) {
            TeamCreateAuthorization.assertCanAssignSchool(false, 99L, setOf(1L, 2L))
        }
    }
}
```

- [ ] **Step 2: Rodar testes**

```powershell
cd backend ; .\gradlew.bat test --tests "com.libare.adm.modules.rbac.application.TeamCreateAuthorizationTest"
```

Expected: PASS

- [ ] **Step 3: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/rbac/application/TeamCreateAuthorization.kt backend/src/test/kotlin/com/libare/adm/modules/rbac/application/TeamCreateAuthorizationTest.kt
git commit -m "test(rbac): authorize team member role and school assignment"
```

---

### Task 2: Migration V19 + provision SCHOOL_ADMIN com team.*

**Files:**
- Create: `backend/src/main/kotlin/db/migration/V19__TeamPermissions.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/schools/application/ProvisionSchoolRolesUseCase.kt`

- [ ] **Step 1: Criar V19** (padrao V18: INSERT permissions WHERE NOT EXISTS + grants)

```kotlin
package db.migration

import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

class V19__TeamPermissions : BaseJavaMigration() {
    override fun migrate(context: Context) {
        val connection = context.connection
        connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'team.view', 'team', 'Listar equipe do painel'
                FROM DUAL
                WHERE NOT EXISTS (SELECT 1 FROM app_permissions WHERE code = 'team.view')
                """.trimIndent()
            )
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'team.create', 'team', 'Criar membros da equipe do painel'
                FROM DUAL
                WHERE NOT EXISTS (SELECT 1 FROM app_permissions WHERE code = 'team.create')
                """.trimIndent()
            )
            // SCHOOL_ADMIN e SUPER_ADMIN (se existir role global) recebem team.*
            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code IN ('team.view', 'team.create')
                WHERE r.name IN ('SCHOOL_ADMIN', 'SUPER_ADMIN')
                """.trimIndent()
            )
        }
    }
}
```

- [ ] **Step 2: Em `provisionSchoolAdmin`, o INSERT IGNORE de permissions ja pega todas exceto lista negra.**  
  Como `team.*` nao esta na blacklist, escolas **novas** ja recebem automaticamente.  
  Confirmar: a blacklist em `ProvisionSchoolRolesUseCase` **nao** inclui `team.view`/`team.create`. Se no futuro alguem adicionar `team` na blacklist, remover. Nenhuma mudanca de codigo obrigatoria se a blacklist atual estiver correta — so revisar o arquivo.

- [ ] **Step 3: Commit**

```powershell
git add backend/src/main/kotlin/db/migration/V19__TeamPermissions.kt
git commit -m "feat(rbac): add team.view and team.create permissions"
```

---

### Task 3: Policy, DTOs, List + Create use cases, controller

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/application/policy/TeamPolicy.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/api/dto/CreateTeamMemberRequest.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/api/dto/TeamMemberResponse.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/application/CreateTeamMemberUseCase.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/rbac/application/ListTeamMembersUseCase.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/rbac/api/AdminUserController.kt`

- [ ] **Step 1: TeamPolicy**

```kotlin
package com.libare.adm.modules.rbac.application.policy

import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class TeamPolicy(private val authorizationService: AuthorizationService) {
    fun requireView() = authorizationService.check("team.view")
    fun requireCreate() = authorizationService.check("team.create")
}
```

- [ ] **Step 2: DTOs**

```kotlin
// CreateTeamMemberRequest.kt
package com.libare.adm.modules.rbac.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CreateTeamMemberRequest(
    @field:NotBlank @field:Size(max = 100) val username: String,
    @field:NotBlank @field:Size(min = 6, max = 100) val password: String,
    @field:NotBlank @field:Size(max = 150) val name: String,
    @field:NotNull val schoolId: Long,
    @field:NotBlank val roleCode: String
)
```

```kotlin
// TeamMemberResponse.kt
package com.libare.adm.modules.rbac.api.dto

data class TeamMemberResponse(
    val id: Long,
    val username: String,
    val name: String,
    val schoolId: Long,
    val schoolName: String?,
    val roleCode: String,
    val status: String
)
```

- [ ] **Step 3: CreateTeamMemberUseCase** — espelhar `CreateSchoolAdminUseCase`, mas:
  - `teamPolicy.requireCreate()`
  - `TenantContext.get()` → `isSuperAdmin`, `resolvedAllowedSchoolIds()`
  - `TeamCreateAuthorization.assertCanCreate` + `assertCanAssignSchool`
  - Resolver role: `roleRepository.findBySchoolIdAndName(schoolId, roleCode)` (`SCHOOL_ADMIN` ou `PROFESSOR`)
  - Salvar user + `app_admin_user_roles` + `app_admin_user_schools`
  - Retornar `TeamMemberResponse` (schoolName via `schoolRepository` se facil)

- [ ] **Step 4: ListTeamMembersUseCase**

```text
requireView()
JdbcTemplate query joining:
  app_admin_users u
  INNER JOIN app_admin_user_schools us ON us.admin_user_id = u.id
  INNER JOIN app_schools s ON s.id = us.school_id
  LEFT JOIN app_admin_user_roles ur ON ur.admin_user_id = u.id
  LEFT JOIN app_roles r ON r.id = ur.role_id AND r.school_id = us.school_id
WHERE:
  - se !super: us.school_id IN (allowedSchoolIds)
  - se super e activeSchoolId != null: us.school_id = activeSchoolId
  - se super sem contexto: todas (ou filtrar query param schoolId opcional)
Excluir is_super_admin = 1 da lista (opcional, recomendado para nao poluir)
ORDER BY u.name
```

Retornar `List<TeamMemberResponse>` (se multiplos roles, preferir role cujo name IN ('SCHOOL_ADMIN','PROFESSOR') LIMIT via DISTINCT/GROUP).

- [ ] **Step 5: AdminUserController**

```kotlin
@GetMapping
fun list(): ResponseEntity<List<TeamMemberResponse>> =
    ResponseEntity.ok(listTeamMembersUseCase.execute())

@PostMapping
fun create(@Valid @RequestBody request: CreateTeamMemberRequest): ResponseEntity<TeamMemberResponse> =
    ResponseEntity.status(HttpStatus.CREATED).body(createTeamMemberUseCase.execute(request))
```

Manter o `PUT /{id}/schools` existente.

- [ ] **Step 6: Compilar**

```powershell
cd backend ; .\gradlew.bat test compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 7: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/rbac
git commit -m "feat(rbac): list and create team members via admin-users API"
```

---

### Task 4: Frontend — types, service, queries

**Files:**
- Create: `frontend-admin/src/types/team.ts`
- Create: `frontend-admin/src/services/teamService.ts`
- Modify: `frontend-admin/src/features/shared/api/queries.ts`

- [ ] **Step 1: Types + service**

```typescript
// types/team.ts
export type TeamRoleCode = "SCHOOL_ADMIN" | "PROFESSOR";

export type TeamMemberResponse = {
  id: number;
  username: string;
  name: string;
  schoolId: number;
  schoolName: string | null;
  roleCode: string;
  status: string;
};

export type CreateTeamMemberRequest = {
  username: string;
  password: string;
  name: string;
  schoolId: number;
  roleCode: TeamRoleCode;
};
```

```typescript
// services/teamService.ts
import { apiRequest } from "../lib/api";
import type { CreateTeamMemberRequest, TeamMemberResponse } from "../types/team";

export function listTeamMembers() {
  return apiRequest<TeamMemberResponse[]>("/api/v1/admin-users");
}

export function createTeamMember(body: CreateTeamMemberRequest) {
  return apiRequest<TeamMemberResponse>("/api/v1/admin-users", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
```

- [ ] **Step 2: queries.ts** — adicionar `team: ["team"]`, `useTeamMembersQuery`, `invalidate.team`

- [ ] **Step 3: Commit**

```powershell
git add frontend-admin/src/types/team.ts frontend-admin/src/services/teamService.ts frontend-admin/src/features/shared/api/queries.ts
git commit -m "feat(frontend): team API client and queries"
```

---

### Task 5: Pagina Equipe + nav + rota

**Files:**
- Create: `frontend-admin/src/ui/components/team/CreateTeamMemberForm.tsx`
- Create: `frontend-admin/src/ui/pages/TeamPage.tsx`
- Modify: `frontend-admin/src/features/layout/config/navigation.ts`
- Modify: `frontend-admin/src/router.tsx`

- [ ] **Step 1: Nav** — no grupo `system`, apos Escolas:

```typescript
{
  id: "team",
  to: "/equipe",
  label: "Equipe",
  icon: Users, // ou UserCog se ja importado; senão Users / Shield
  description: "Admins e professores do painel",
  permission: "team.view",
  keywords: ["professor", "admin", "staff", "equipe"]
}
```

- [ ] **Step 2: Router** — lazy `TeamPage`, `<Route path="/equipe" ... />`

- [ ] **Step 3: CreateTeamMemberForm**
  - Campos: username, name, password, schoolId (select), roleCode (select)
  - Props: `isSuperAdmin`, `schoolOptions`, `defaultSchoolId`
  - Se `!isSuperAdmin`: roleCode fixo `PROFESSOR` (input disabled ou hidden); escola so options do caller (lista de escolas do `useSchoolsQuery` ja filtrada pelo backend)
  - Se `isSuperAdmin`: select `SCHOOL_ADMIN` | `PROFESSOR`

- [ ] **Step 4: TeamPage** — espelhar estrutura de `UsersPage` / `SchoolsPage`:
  - `ListingPageShell` + hero “Equipe do painel”
  - `PermissionGate permission="team.create"` no form
  - Tabela: nome, username, escola, perfil, status
  - Submit → `createTeamMember` → invalidate.team

- [ ] **Step 5: Commit**

```powershell
git add frontend-admin/src/ui/pages/TeamPage.tsx frontend-admin/src/ui/components/team frontend-admin/src/features/layout/config/navigation.ts frontend-admin/src/router.tsx
git commit -m "feat(frontend): Equipe page for panel staff"
```

---

### Task 6: Usuarios copy + escola escola; limpar Escolas

**Files:**
- Modify: `frontend-admin/src/ui/pages/UsersPage.tsx`
- Modify: `frontend-admin/src/ui/components/users/CreateUserForm.tsx`
- Modify: `frontend-admin/src/features/layout/config/navigation.ts` (label/description Usuarios)
- Modify: `frontend-admin/src/ui/pages/SchoolsPage.tsx`
- Modify: `frontend-admin/src/services/schoolsService.ts` (opcional: manter `createSchoolAdmin` export morto ou remover se so Schools usava)

- [ ] **Step 1: Nav Usuarios**
  - label: `Usuarios do app` (ou manter “Usuarios” e description: `Leitores do aplicativo`)
  - description: `Leitores do app (acervo)`

- [ ] **Step 2: CreateUserForm** — props novas `schoolLabel: string | null`
  - Campo readonly no topo: “Escola” com `schoolLabel` ou “Selecione uma escola no painel”
  - Botao submit text: “Criar leitor” (se o texto estiver no form; senao em UsersPage)
  - Hero/subtitle da UsersPage: mencionar “usuarios do aplicativo”, nao staff

- [ ] **Step 3: UsersPage** — resolver nome da escola:

```typescript
const schoolsQuery = useSchoolsQuery(); // ja existe
const schoolLabel = useMemo(() => {
  if (!schoolContextId) return null;
  return schoolsQuery.data?.find((s) => s.id === schoolContextId)?.name ?? `Escola #${schoolContextId}`;
}, [schoolContextId, schoolsQuery.data]);
```

Passar para o form. Ajustar titulos do `BerryFormPanel` / hero para “Criar leitor”.

- [ ] **Step 4: SchoolsPage** — remover:
  - estado `adminForm`, `adminError`, `adminSuccess`
  - `handleCreateAdmin`
  - UI do subpainel “Criar admin da escola”
  - import `createSchoolAdmin` se nao usado

- [ ] **Step 5: Commit**

```powershell
git add frontend-admin/src/ui/pages/UsersPage.tsx frontend-admin/src/ui/components/users/CreateUserForm.tsx frontend-admin/src/ui/pages/SchoolsPage.tsx frontend-admin/src/features/layout/config/navigation.ts frontend-admin/src/services/schoolsService.ts
git commit -m "fix(ui): clarify app users vs team; remove school admin subform"
```

---

### Task 7: Verificacao manual

- [ ] **Step 1: Subir backend** (migration V19) e frontend local ou rebuild Docker.

- [ ] **Step 2: Checklist**

| Login | Acao | Esperado |
|-------|------|----------|
| `teste.admin` (SUPER) | Nav ve Equipe | Sim |
| SUPER | POST Equipe SCHOOL_ADMIN | 201 |
| SUPER | POST Equipe PROFESSOR | 201 |
| SCHOOL_ADMIN da escola | Equipe so cria PROFESSOR | OK / 403 se forcar SCHOOL_ADMIN |
| SCHOOL_ADMIN | Usuarios cria leitor com acervo | 201 |
| `teste.professor` | Sem Equipe/Usuarios na nav | OK |
| `teste.professor` | POST `/api/v1/admin-users` | 403 |
| Escolas | Sem subform criar admin | OK |

- [ ] **Step 3: Rodar testes unitarios finais**

```powershell
cd backend ; .\gradlew.bat test --tests "com.libare.adm.modules.rbac.application.TeamCreateAuthorizationTest"
```

- [ ] **Step 4: Commit final se houver ajustes** (so se houver diff)

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Pagina Equipe | Task 5 |
| SUPER cria SCHOOL_ADMIN + PROFESSOR | Tasks 1, 3, 5 |
| SCHOOL_ADMIN so PROFESSOR | Tasks 1, 3, 5 |
| PROFESSOR nao cria | perms V19 + nav gate |
| SCHOOL_ADMIN cria leitores | inalterado + Task 6 copy |
| Remover subform Escolas | Task 6 |
| Usuarios: escola readonly + acervo | Task 6 |
| Sem edit/delete equipe | YAGNI — nao ha tasks |
| team.view / team.create | Task 2 |

Sem placeholders TBD no plano.
