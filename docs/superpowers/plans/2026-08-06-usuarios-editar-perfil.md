# Usuários — editar perfil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir editar nome, email e telefone de leitores via `PUT /api/v1/users/{id}` + FormModal no admin.

**Architecture:** Backend espelha `UpdateUserAcervoUseCase` (policy `users.update` + `assertCanModify`). Front: `UserFormModal` create+edit (sem senha no edit); botão Editar na linha e no DetailModal; cadastro deixa o `BerryFormPanel` e passa ao modal.

**Tech Stack:** Kotlin/Spring Boot 3, MockMvc IT, React + Vite (`frontend-admin`).

**Spec:** `docs/superpowers/specs/2026-08-06-usuarios-editar-perfil-design.md`

**Referências:** `UpdateUserAcervoUseCase.kt`, `CreateUserIT.kt`, `SchoolFormModal` / `SchoolsPage` (padrão FormModal).

---

## File map

| Ação | Path |
|------|------|
| Create | `backend/.../users/api/dto/UpdateUserProfileRequest.kt` |
| Create | `backend/.../users/application/UpdateUserProfileUseCase.kt` |
| Create | `backend/src/test/kotlin/com/libare/adm/users/UpdateUserProfileIT.kt` |
| Modify | `backend/.../users/infrastructure/persistence/repository/UserJpaRepository.kt` |
| Modify | `backend/.../users/api/UserController.kt` |
| Modify | `frontend-admin/src/types/users.ts` |
| Modify | `frontend-admin/src/services/usersService.ts` |
| Create | `frontend-admin/src/ui/components/users/UsersForm.tsx` |
| Create | `frontend-admin/src/ui/components/users/UserFormModal.tsx` |
| Modify | `frontend-admin/src/ui/components/users/UserDetailModal.tsx` |
| Modify | `frontend-admin/src/ui/pages/UsersPage.tsx` |
| Optional keep | `CreateUserForm.tsx` — pode ficar se `UsersForm` o substituir; se substituir 100%, deletar ou reexportar helpers |

---

### Task 1: Backend — DTO + repositório + use case + controller

**Files:**
- Create: `UpdateUserProfileRequest.kt`, `UpdateUserProfileUseCase.kt`
- Modify: `UserJpaRepository.kt`, `UserController.kt`
- Test: `UpdateUserProfileIT.kt`

- [ ] **Step 1: Adicionar query de email excluindo id**

Em `UserJpaRepository.kt`:

```kotlin
@Query(
    value = """
        SELECT COUNT(*)
        FROM tbl_users
        WHERE LOWER(email) = LOWER(:email)
          AND id <> :excludeId
          AND (is_deleted = 0 OR is_deleted IS NULL)
    """,
    nativeQuery = true
)
fun countByEmailIgnoreCaseExcludingId(
    @Param("email") email: String,
    @Param("excludeId") excludeId: Long
): Long
```

- [ ] **Step 2: Criar `UpdateUserProfileRequest.kt`**

```kotlin
package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Atualizacao de perfil do leitor (nome, email, telefone)")
data class UpdateUserProfileRequest(
    @field:NotBlank @field:Size(max = 150)
    @field:Schema(description = "Nome completo", example = "Maria Silva", requiredMode = Schema.RequiredMode.REQUIRED)
    val name: String,

    @field:NotBlank @field:Email @field:Size(max = 190)
    @field:Schema(description = "Email de login", example = "maria@email.com", requiredMode = Schema.RequiredMode.REQUIRED)
    val email: String,

    @field:NotBlank @field:Size(max = 40)
    @field:Schema(description = "Telefone", example = "98999990000", requiredMode = Schema.RequiredMode.REQUIRED)
    val phone: String
)
```

- [ ] **Step 3: Criar `UpdateUserProfileUseCase.kt`**

Espelhar `UpdateUserAcervoUseCase`: audit actor, `userPolicy.requireUpdate()`, findById → NotFound, `assertCanModify`, validar email único com `countByEmailIgnoreCaseExcludingId`, save `UserEntity` copiando password/image/acervo/status/etc. e atualizando name/email/phone trimados.

```kotlin
@Service
class UpdateUserProfileUseCase(
    private val userRepository: UserJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(userId: Long, request: UpdateUserProfileRequest): UserResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        userPolicy.requireUpdate()

        val existing = userRepository.findById(userId)
            .orElseThrow { NotFoundException("Usuario nao encontrado") }
        userPolicy.assertCanModify(existing)

        val email = request.email.trim()
        if (userRepository.countByEmailIgnoreCaseExcludingId(email, userId) > 0) {
            throw BadRequestException("Ja existe um usuario com este email")
        }

        val updated = userRepository.save(
            UserEntity(
                id = existing.id,
                name = request.name.trim(),
                email = email,
                password = existing.password,
                phone = request.phone.trim(),
                userType = existing.userType,
                userImage = existing.userImage,
                authId = existing.authId,
                isDeleted = existing.isDeleted,
                registeredOn = existing.registeredOn,
                acervoId = existing.acervoId,
                schoolId = existing.schoolId,
                status = existing.status
            )
        )
        return userResponseMapper.fromEntity(updated)
    }
}
```

- [ ] **Step 4: Expor no `UserController`**

Injetar `UpdateUserProfileUseCase`. Adicionar:

```kotlin
@Operation(summary = "Atualizar perfil do leitor", description = "Altera nome, email e telefone. Nao altera senha, foto, acervo nem status.")
@AdminSecured
@AdminWriteResponses
@ApiResponses(value = [ApiResponse(responseCode = "200", description = "Perfil atualizado", content = [Content(schema = Schema(implementation = UserResponse::class))])])
@PutMapping("/{userId}")
fun updateProfile(
    @Parameter(description = "ID do leitor") @PathVariable userId: Long,
    @Valid @RequestBody request: UpdateUserProfileRequest
): ResponseEntity<UserResponse> =
    ResponseEntity.ok(updateUserProfileUseCase.execute(userId, request))
```

**Atenção:** path `PUT /{userId}` não conflita com `PUT /{userId}/status` e `PUT /{userId}/acervo` (mais específicos).

- [ ] **Step 5: IT `UpdateUserProfileIT.kt`**

Baseado em `CreateUserIT` (login, acervo, cleanup por email). Testes mínimos:

1. `super admin updates user profile` — criar user (POST), PUT name/email/phone, assert 200 e campos; password hash inalterado.
2. `update profile with duplicate email returns 400` — dois users; tentar email do outro.
3. `update profile keeping same email succeeds` — PUT com mesmo email, só muda nome.

Helpers: reutilizar padrão `login`, `requireAcervoPair`, `createBody` do CreateUserIT (copiar privados necessários). Usar `mockMvc.put` de `org.springframework.test.web.servlet.put`.

Run (requer MySQL local/dev como CreateUserIT):

```powershell
cd backend
.\gradlew.bat test --tests com.libare.adm.users.UpdateUserProfileIT --no-daemon
```

Expected: PASS (ou SKIP documentado se DB indisponível — preferir PASS no ambiente do projeto).

Se IT não puder rodar no CI local sem DB, ainda assim escrever o teste; validar compile:

```powershell
.\gradlew.bat compileKotlin compileTestKotlin --no-daemon
```

- [ ] **Step 6: Commit backend**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/users/api/dto/UpdateUserProfileRequest.kt `
  backend/src/main/kotlin/com/libare/adm/modules/users/application/UpdateUserProfileUseCase.kt `
  backend/src/main/kotlin/com/libare/adm/modules/users/infrastructure/persistence/repository/UserJpaRepository.kt `
  backend/src/main/kotlin/com/libare/adm/modules/users/api/UserController.kt `
  backend/src/test/kotlin/com/libare/adm/users/UpdateUserProfileIT.kt
git commit -m "feat(users): PUT perfil (nome, email, telefone)"
```

---

### Task 2: Frontend — types, service, form, modal

**Files:**
- Modify: `types/users.ts`, `services/usersService.ts`
- Create: `UsersForm.tsx`, `UserFormModal.tsx`

- [ ] **Step 1: Types + service**

```ts
// types/users.ts
export type UpdateUserProfileRequest = {
  name: string;
  email: string;
  phone: string;
};
```

```ts
// usersService.ts
export function updateUserProfile(
  userId: number,
  payload: UpdateUserProfileRequest
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/v1/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
```

- [ ] **Step 2: `UsersForm.tsx`**

Form unificado create/edit:

Props principais:
- `mode: "create" | "edit"`
- `form`: state com name, email, phone, e no create também password, acervoId, status
- `inModal`, `saving`, `needsSchoolContext`, `schoolLabel`, `acervoOptions`
- `isFormInvalid`, `onSubmit`, `onReset`, `onChange`

No **edit**: mostrar só nome, email, telefone (sem senha/acervo/status/escola read-only opcional).
No **create**: campos atuais de `CreateUserForm` (pode mover JSX de `CreateUserForm` para cá e fazer `CreateUserForm` reexportar ou deletar após migração).

Botões: submit label "Criar usuario" / "Salvar perfil"; secundário Cancelar se `inModal`.

- [ ] **Step 3: `UserFormModal.tsx`**

```tsx
<Modal
  open={open}
  onClose={onClose}
  title={editingId ? "Editar usuario" : "Novo usuario"}
  description={editingId ? `Atualize o perfil #${editingId}.` : "Cadastre um leitor do aplicativo."}
  size="lg"
  className="max-w-2xl"
  closeOnOverlayClick={!saving}
>
  <div className="book-form-modal-body">
    <UsersForm ... inModal mode={editingId ? "edit" : "create"} />
    {error ? <p className="error-text mt-3">{error}</p> : null}
  </div>
</Modal>
```

- [ ] **Step 4: Commit front components**

```powershell
git add frontend-admin/src/types/users.ts frontend-admin/src/services/usersService.ts `
  frontend-admin/src/ui/components/users/UsersForm.tsx `
  frontend-admin/src/ui/components/users/UserFormModal.tsx
git commit -m "feat(admin): FormModal e service de perfil de usuario"
```

---

### Task 3: Wire UsersPage + DetailModal

**Files:**
- Modify: `UsersPage.tsx`, `UserDetailModal.tsx`
- Possibly delete or thin `CreateUserForm.tsx` if fully replaced

- [ ] **Step 1: UserDetailModal — botão Editar**

Adicionar prop `onEdit?: (user: UserResponse) => void` e no footer (antes de Ativar), se `onEdit`:

```tsx
<Button variant="secondary" onClick={() => { onEdit(currentUser); }} disabled={saving}>
  Editar
</Button>
```

(Não fechar detalhe automaticamente se a page preferir fechar detalhe ao abrir form — page decide: tipicamente `setSelectedUser(null); openEdit(user)`.)

- [ ] **Step 2: UsersPage**

Estado:
- `formModalOpen`, `editingId: number | null`
- Form state: reutilizar/estender `CreateUserFormState` (no edit, password pode ficar `""` e não ser enviado)

Funções:
- `openCreateForm` / `closeFormModal` / `handleEdit(user)`
- `handleSubmit`: se `editingId` → `updateUserProfile` com `{ name, email, phone }`; senão `createUser`
- Hero: botão **Novo usuario** (PermissionGate create) em vez de (ou além de) BerryFormPanel
- Remover `BerryFormPanel` de create
- Coluna ações: botão **Editar** se `canUpdateUser`
- Render `UserFormModal` + passar `onEdit` ao DetailModal

Invalidação: `invalidate.users()` + toast/success message.

- [ ] **Step 3: Typecheck**

```powershell
cd frontend-admin ; npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 4: Commit**

```powershell
git add frontend-admin/src/ui/pages/UsersPage.tsx `
  frontend-admin/src/ui/components/users/UserDetailModal.tsx `
  frontend-admin/src/ui/components/users/CreateUserForm.tsx
git commit -m "feat(admin): editar perfil de usuario na listagem"
```

---

### Task 4: Verificação + spec

- [ ] **Step 1:** `tsc` + `compileKotlin` (e IT se DB disponível)
- [ ] **Step 2:** Atualizar spec status → `implementado` e critérios `[x]`
- [ ] **Step 3:** Commit docs

```powershell
git add docs/superpowers/specs/2026-08-06-usuarios-editar-perfil-design.md
git commit -m "docs(spec): marcar edicao de perfil de usuarios como implementada"
```

---

## Spec coverage

| Requisito | Task |
|-----------|------|
| PUT perfil name/email/phone | 1 |
| Email único excluindo self | 1 |
| Não altera senha/foto/acervo/status | 1 |
| FormModal create+edit | 2–3 |
| Editar na linha + DetailModal | 3 |
| Acervo/status/delete preservados | 3 |
| tsc / compile | 1, 3, 4 |
