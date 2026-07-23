# Módulo Site (admin + api_sites) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar CRUD admin completo do grupo Site no React+Kotlin e espelho público `/api_sites.php` (envelope `Galileu`), para desligar o PHP das telas `*_site.php` e de `api_sites.php`.

**Architecture:** Pacote novo `modules/site/` com use cases compartilhados; adapters admin REST (`/api/v1/sites*`) com JWT + `sites.*`; adapter leitor `ApiSitesController` + dispatcher `method_name`; JPA nas tabelas legadas `Sites` / `Autores_site` / etc.; assets via `LegacyBookAssetStorage` e `/legacy/assets`.

**Tech Stack:** Kotlin 1.9 / Spring Boot 3.3 / JPA / MySQL legado / React (Vite + TanStack Query) / Berry UI / MockMvc IT

**Spec:** `docs/superpowers/specs/2026-07-23-site-module-design.md`

**Pré-requisitos locais:** MySQL `adm_libare`, env via `scripts/local/dev.local.ps1`, backend porta 8080, PHP canónico em `C:\Users\User\Repository\adm-projeto\adm-libares\`.

**Credencial IT:** `teste.admin` / `Admin@123`

**Nota PowerShell:** commits com `git commit -m "mensagem"` (sem heredoc bash).

---

## Mapa de arquivos

| Área | Criar | Modificar |
|------|-------|-----------|
| RBAC | `V13__site_permissions.sql` | `ProvisionSchoolRolesUseCase.kt`, `SyncRolePermissionsUseCase.SCHOOL_EXCLUDED_PERMISSIONS` |
| Policy | `SitePolicy.kt`, `SiteCommentPolicy.kt` | — |
| Authors Site | entity/repo/DTOs/use cases/controller + `SiteAuthorCrudIT.kt` | — |
| Categories Site | entity/repo/DTOs/use cases/controller + IT | — |
| Sections Site | entity/repo/DTOs/use cases/controller + IT | — |
| Sites | entity/repo/DTOs/use cases/controller + `SiteCrudIT.kt` | — |
| Comments Site | entity/repo/DTOs/use cases/controller + IT | — |
| Leitor | `ApiSitesController.kt`, `ApiSitesDispatcher.kt`, `GalileuEnvelope.kt`, `ApiSitesIT.kt` | `SecurityConfig.kt` |
| Frontend | pages/services/types Site | `navigation.ts`, `router.tsx` |

Base Kotlin: `backend/src/main/kotlin/com/libare/adm/modules/site/`  
Base IT: `backend/src/test/kotlin/com/libare/adm/site/`

---

### Task 0: Confirmar nomes exatos das tabelas Site no MySQL

**Files:** nenhum (só descoberta)

- [ ] **Step 1: Listar tabelas**

```powershell
mysql -uroot -padmin -e "SHOW TABLES FROM adm_libare LIKE '%site%'; SHOW TABLES FROM adm_libare LIKE 'Sites'; SHOW COLUMNS FROM adm_libare.Sites; SHOW COLUMNS FROM adm_libare.Autores_site;"
```

Expected: nomes reais (pode haver encoding em `Categoría_site`, `Seções_site`, `vizualização_site`). Anotar e usar **exatamente** esses nomes em `@Table(name = "...")` com backticks se necessário (`name = "\`Categoría_site\`"` não é válido no JPA — usar o nome Unicode exato retornado).

- [ ] **Step 2: Commit de nota (opcional)**

Se os nomes divergirem do spec, atualizar uma linha em `docs/superpowers/specs/2026-07-23-site-module-design.md` na seção “Modelo de dados” e commit:

```powershell
git add docs/superpowers/specs/2026-07-23-site-module-design.md
git commit -m "docs(site): confirm exact MySQL table names for Site module"
```

---

### Task 1: Permissões `sites.*` + exclusão de perfis de escola

**Files:**
- Create: `backend/src/main/resources/db/migration/V13__site_permissions.sql`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/rbac/application/RoleSupportServices.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/schools/application/ProvisionSchoolRolesUseCase.kt`
- Test: `backend/src/test/kotlin/com/libare/adm/site/SitePermissionsIT.kt`

- [ ] **Step 1: IT falhando — permissões existem e SCHOOL_ADMIN não as recebe no provision**

```kotlin
package com.libare.adm.site

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate

@SpringBootTest
class SitePermissionsIT {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Test
    fun `sites permissions exist and are granted to SUPER_ADMIN`() {
        val codes = listOf(
            "sites.view", "sites.create", "sites.update", "sites.delete",
            "sites.comments.view", "sites.comments.moderate"
        )
        codes.forEach { code ->
            val n = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app_permissions WHERE code = ?",
                Int::class.java,
                code
            )!!
            assertTrue(n >= 1, "Falta permissao $code")
        }
        val superHas = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM app_role_permissions rp
            INNER JOIN app_roles r ON r.id = rp.role_id
            INNER JOIN app_permissions p ON p.id = rp.permission_id
            WHERE r.name = 'SUPER_ADMIN' AND r.school_id IS NULL AND p.code = 'sites.view'
            """.trimIndent(),
            Int::class.java
        )!!
        assertTrue(superHas >= 1)
    }

    @Test
    fun `SCHOOL_ADMIN roles do not get sites_view by default`() {
        val n = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM app_role_permissions rp
            INNER JOIN app_roles r ON r.id = rp.role_id
            INNER JOIN app_permissions p ON p.id = rp.permission_id
            WHERE r.name = 'SCHOOL_ADMIN' AND r.school_id IS NOT NULL AND p.code = 'sites.view'
            """.trimIndent(),
            Int::class.java
        )!!
        assertFalse(n > 0, "SCHOOL_ADMIN nao deve receber sites.* por padrao")
    }
}
```

- [ ] **Step 2: Rodar IT e ver falha**

```powershell
cd "C:\Users\User\Repository\Restruturacao ´Projeto PhP\backend"
. "..\scripts\local\dev.local.ps1"
$env:DB_PASSWORD = $script:DevDbPassword
.\gradlew.bat test --tests com.libare.adm.site.SitePermissionsIT --no-daemon
```

Expected: FAIL (permissões ausentes)

- [ ] **Step 3: Criar `V13__site_permissions.sql`**

```sql
-- Permissões do módulo Site (plataforma / globais)
INSERT IGNORE INTO app_permissions (code, module, description) VALUES
    ('sites.view', 'sites', 'Visualizar Sites, autores, categorias e secoes'),
    ('sites.create', 'sites', 'Criar Sites, autores, categorias e secoes'),
    ('sites.update', 'sites', 'Editar Sites, autores, categorias e secoes'),
    ('sites.delete', 'sites', 'Excluir Sites, autores, categorias e secoes'),
    ('sites.comments.view', 'sites', 'Visualizar comentarios de Sites'),
    ('sites.comments.moderate', 'sites', 'Moderar/remover comentarios de Sites');

-- SUPER_ADMIN global recebe todas (incluindo as novas)
INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND r.school_id IS NULL;

-- Remover sites.* de SCHOOL_ADMIN existentes (caso CROSS JOIN anterior as tenha puxado)
DELETE rp FROM app_role_permissions rp
INNER JOIN app_roles r ON r.id = rp.role_id
INNER JOIN app_permissions p ON p.id = rp.permission_id
WHERE r.name = 'SCHOOL_ADMIN'
  AND r.school_id IS NOT NULL
  AND p.code IN (
    'sites.view', 'sites.create', 'sites.update', 'sites.delete',
    'sites.comments.view', 'sites.comments.moderate'
  );
```

- [ ] **Step 4: Excluir `sites.*` no provisioner e no sync de roles de escola**

Em `RoleSupportServices.kt` (`SyncRolePermissionsUseCase.companion`):

```kotlin
val SCHOOL_EXCLUDED_PERMISSIONS = setOf(
    "schools.view",
    "schools.create",
    "schools.update",
    "schools.delete",
    "platform.impersonate",
    "sites.view",
    "sites.create",
    "sites.update",
    "sites.delete",
    "sites.comments.view",
    "sites.comments.moderate"
)
```

Em `ProvisionSchoolRolesUseCase.kt`, expandir o `NOT IN`:

```kotlin
WHERE p.code NOT IN (
    'schools.view', 'schools.create', 'schools.update', 'schools.delete', 'platform.impersonate',
    'sites.view', 'sites.create', 'sites.update', 'sites.delete',
    'sites.comments.view', 'sites.comments.moderate'
)
```

- [ ] **Step 5: Rodar IT — PASS**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.SitePermissionsIT --no-daemon
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 6: Commit**

```powershell
git add backend/src/main/resources/db/migration/V13__site_permissions.sql backend/src/main/kotlin/com/libare/adm/modules/rbac/application/RoleSupportServices.kt backend/src/main/kotlin/com/libare/adm/modules/schools/application/ProvisionSchoolRolesUseCase.kt backend/src/test/kotlin/com/libare/adm/site/SitePermissionsIT.kt
git commit -m "feat(rbac): add sites.* permissions excluded from school roles"
```

---

### Task 2: SitePolicy + CRUD Autores Site

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/site/application/policy/SitePolicy.kt`
- Create: `.../site/infrastructure/persistence/entity/SiteAuthorEntity.kt`
- Create: `.../site/infrastructure/persistence/repository/SiteAuthorJpaRepository.kt`
- Create: `.../site/api/dto/SiteAuthorDtos.kt` (request/response/upload)
- Create: `.../site/application/SiteAuthorCrudUseCases.kt`
- Create: `.../site/api/SiteAuthorController.kt`
- Test: `backend/src/test/kotlin/com/libare/adm/site/SiteAuthorCrudIT.kt`

- [ ] **Step 1: IT falhando**

```kotlin
package com.libare.adm.site

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class SiteAuthorCrudIT {
    @Autowired private lateinit var mockMvc: MockMvc
    @Autowired private lateinit var jdbcTemplate: JdbcTemplate
    private val objectMapper = ObjectMapper()
    private val ids = mutableListOf<Long>()

    @AfterEach
    fun tearDown() {
        ids.forEach { jdbcTemplate.update("DELETE FROM Autores_site WHERE author_id = ?", it) }
        ids.clear()
    }

    @Test
    fun `create list and soft-delete site author`() {
        val token = login("teste.admin", "Admin@123")
        val name = "IT Site Author ${System.currentTimeMillis()}"
        val body = """{"name":"$name","image":"","description":"bio","status":"1"}"""
        val createdJson = mockMvc.post("/api/v1/site-authors") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = body
        }.andExpect { status { isCreated() } }.andReturn().response.contentAsString
        val id = objectMapper.readTree(createdJson).path("id").asLong()
        assertTrue(id > 0)
        ids += id

        mockMvc.get("/api/v1/site-authors") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isOk() } }

        mockMvc.delete("/api/v1/site-authors/$id") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val status = jdbcTemplate.queryForObject(
            "SELECT status FROM Autores_site WHERE author_id = ?",
            String::class.java,
            id
        )
        // Se a coluna for outro nome (ex. a_status), ajustar entity + IT apos Task 0
        assertEquals("0", status)
    }

    private fun login(username: String, password: String): String {
        val loginJson = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"$username","password":"$password"}"""
        }.andReturn().response.contentAsString
        return Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
            ?: error("Login falhou: $loginJson")
    }
}
```

Se `SHOW COLUMNS` mostrar que `Autores_site` **não** tem coluna `status`, use soft-delete físico `DELETE` ou confirme coluna real e ajuste IT/entity.

- [ ] **Step 2: Rodar — FAIL (404 / No mapping)**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.SiteAuthorCrudIT --no-daemon
```

- [ ] **Step 3: Implementar policy + entity + repo + DTOs + use cases + controller**

`SitePolicy.kt`:

```kotlin
package com.libare.adm.modules.site.application.policy

import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class SitePolicy(
    private val authorizationService: AuthorizationService
) {
    fun requireView() = authorizationService.check("sites.view")
    fun requireCreate() = authorizationService.check("sites.create")
    fun requireUpdate() = authorizationService.check("sites.update")
    fun requireDelete() = authorizationService.check("sites.delete")
}
```

`SiteAuthorEntity.kt` (ajustar `@Table` / colunas ao Task 0):

```kotlin
package com.libare.adm.modules.site.infrastructure.persistence.entity

import jakarta.persistence.*

@Entity
@Table(name = "Autores_site")
class SiteAuthorEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "author_id")
    val id: Long = 0,

    @Column(name = "author_name", nullable = false, length = 255)
    val name: String,

    @Column(name = "author_image", nullable = false, length = 255)
    val image: String = "",

    @Column(name = "author_description", columnDefinition = "LONGTEXT")
    val description: String? = null,

    @Column(name = "status", nullable = false)
    val status: String = "1"
)
```

`SiteAuthorJpaRepository.kt`:

```kotlin
package com.libare.adm.modules.site.infrastructure.persistence.repository

import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteAuthorEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SiteAuthorJpaRepository : JpaRepository<SiteAuthorEntity, Long> {
    fun findAllByOrderByIdDesc(): List<SiteAuthorEntity>
    fun existsByNameIgnoreCase(name: String): Boolean
    fun existsByNameIgnoreCaseAndIdNot(name: String, id: Long): Boolean
}
```

DTOs (`SiteAuthorDtos.kt`):

```kotlin
package com.libare.adm.modules.site.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertSiteAuthorRequest(
    @field:NotBlank @field:Size(max = 255) val name: String,
    @field:Size(max = 255) val image: String? = null,
    val description: String? = null,
    @field:Size(max = 1) val status: String = "1"
)

data class SiteAuthorResponse(
    val id: Long,
    val name: String,
    val image: String,
    val description: String?,
    val status: String
)

data class SiteAuthorImageUploadResponse(val filename: String)
```

`SiteAuthorCrudUseCases.kt`:

```kotlin
package com.libare.adm.modules.site.application

import com.libare.adm.modules.site.api.dto.SiteAuthorResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteAuthorRequest
import com.libare.adm.modules.site.application.policy.SitePolicy
import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteAuthorEntity
import com.libare.adm.modules.site.infrastructure.persistence.repository.SiteAuthorJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListSiteAuthorsUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    fun execute(): List<SiteAuthorResponse> {
        sitePolicy.requireView()
        return repo.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateSiteAuthorUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(request: UpsertSiteAuthorRequest): SiteAuthorResponse {
        sitePolicy.requireCreate()
        val name = request.name.trim()
        if (repo.existsByNameIgnoreCase(name)) {
            throw BadRequestException("Ja existe um autor Site com este nome")
        }
        val saved = repo.save(
            SiteAuthorEntity(
                name = name,
                image = request.image?.trim().orEmpty(),
                description = request.description?.trim()?.ifBlank { "" } ?: "",
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )
        return toResponse(saved)
    }
}

@Service
class UpdateSiteAuthorUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(authorId: Long, request: UpsertSiteAuthorRequest): SiteAuthorResponse {
        sitePolicy.requireUpdate()
        val existing = repo.findById(authorId).orElseThrow { NotFoundException("Autor Site nao encontrado") }
        val name = request.name.trim()
        if (repo.existsByNameIgnoreCaseAndIdNot(name, authorId)) {
            throw BadRequestException("Ja existe um autor Site com este nome")
        }
        val saved = repo.save(
            SiteAuthorEntity(
                id = existing.id,
                name = name,
                image = request.image?.trim() ?: existing.image,
                description = when {
                    request.description == null -> existing.description ?: ""
                    else -> request.description.trim().ifBlank { "" }
                },
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )
        return toResponse(saved)
    }
}

@Service
class DeleteSiteAuthorUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(authorId: Long) {
        sitePolicy.requireDelete()
        val existing = repo.findById(authorId).orElseThrow { NotFoundException("Autor Site nao encontrado") }
        repo.save(
            SiteAuthorEntity(
                id = existing.id,
                name = existing.name,
                image = existing.image,
                description = existing.description ?: "",
                status = "0"
            )
        )
    }
}

private fun toResponse(e: SiteAuthorEntity) = SiteAuthorResponse(
    id = e.id,
    name = e.name,
    image = e.image,
    description = e.description,
    status = e.status
)
```

`SiteAuthorController.kt`:

```kotlin
package com.libare.adm.modules.site.api

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.site.api.dto.*
import com.libare.adm.modules.site.application.*
import com.libare.adm.shared.security.AuthorizationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1/site-authors")
class SiteAuthorController(
    private val listSiteAuthorsUseCase: ListSiteAuthorsUseCase,
    private val createSiteAuthorUseCase: CreateSiteAuthorUseCase,
    private val updateSiteAuthorUseCase: UpdateSiteAuthorUseCase,
    private val deleteSiteAuthorUseCase: DeleteSiteAuthorUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @GetMapping
    fun list() = ResponseEntity.ok(listSiteAuthorsUseCase.execute())

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteAuthorRequest) =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteAuthorUseCase.execute(request))

    @PutMapping("/{authorId}")
    fun update(@PathVariable authorId: Long, @Valid @RequestBody request: UpsertSiteAuthorRequest) =
        ResponseEntity.ok(updateSiteAuthorUseCase.execute(authorId, request))

    @DeleteMapping("/{authorId}")
    fun delete(@PathVariable authorId: Long): ResponseEntity<Void> {
        deleteSiteAuthorUseCase.execute(authorId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/upload/image")
    fun upload(@RequestParam("file") file: MultipartFile): ResponseEntity<SiteAuthorImageUploadResponse> {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            authorizationService.check("sites.create")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(SiteAuthorImageUploadResponse(filename))
    }
}
```

- [ ] **Step 4: Rodar IT — PASS**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.SiteAuthorCrudIT --no-daemon
```

- [ ] **Step 5: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/site backend/src/test/kotlin/com/libare/adm/site/SiteAuthorCrudIT.kt
git commit -m "feat(site): CRUD site-authors with sites.* policy"
```

---

### Task 3: CRUD Categorias Site

**Files:**
- Create: `SiteCategoryEntity.kt` (`@Table` = nome exato de `Categoría_site` / equivalente)
- Create: `SiteCategoryJpaRepository.kt`, DTOs, `SiteCategoryCrudUseCases.kt`, `SiteCategoryController.kt` (`/api/v1/site-categories`)
- Test: `SiteCategoryCrudIT.kt`

- [ ] **Step 1: IT falhando** — create/list/delete em `/api/v1/site-categories` (mesmo padrão de `SiteAuthorCrudIT`, campos `name`, `image`, `status` se existir; PK `cid`).

- [ ] **Step 2: Rodar — FAIL**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.SiteCategoryCrudIT --no-daemon
```

- [ ] **Step 3: Implementar** — entity:

```kotlin
@Entity
@Table(name = "Categoría_site") // nome exacto do Task 0
class SiteCategoryEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cid")
    val id: Int = 0,
    @Column(name = "category_name", nullable = false) val name: String,
    @Column(name = "category_image", nullable = false) val image: String = ""
)
```

Use cases com `SitePolicy`; upload imagem via `storeCatalogImage`. Soft-delete: se não houver coluna status, hard-delete **apenas** se nenhum Site referenciar o `cid` no CSV `cat_id` (senão `BadRequestException`). Preferir hard-delete com guard se o PHP legado deletava de verdade.

- [ ] **Step 4: PASS + commit**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.SiteCategoryCrudIT --no-daemon
git add backend/src/main/kotlin/com/libare/adm/modules/site backend/src/test/kotlin/com/libare/adm/site/SiteCategoryCrudIT.kt
git commit -m "feat(site): CRUD site-categories"
```

---

### Task 4: CRUD Seções Site

**Files:**
- Create: `SiteSectionEntity.kt` (`Seções_site`), repo, DTOs (`title`, `siteIds: List<Long>`, `status`), use cases, `SiteSectionController` (`/api/v1/site-sections`)
- Test: `SiteSectionCrudIT.kt`

- [ ] **Step 1: IT** — POST com `{"title":"...","siteIds":[],"status":"1"}`, GET list, DELETE soft (`status=0`).

- [ ] **Step 2: FAIL → implement**

`section_books` persiste CSV (`siteIds.joinToString(",")`). List response faz `split` → `List<Long>`.

```kotlin
@Entity
@Table(name = "Seções_site") // exacto Task 0
class SiteSectionEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Column(name = "section_title") val title: String,
    @Column(name = "section_books", columnDefinition = "LONGTEXT") val siteIdsCsv: String = "",
    @Column(name = "status") val status: Int = 1
)
```

- [ ] **Step 3: PASS + commit**

```powershell
git commit -m "feat(site): CRUD site-sections"
```

---

### Task 5: CRUD Sites (conteúdo principal)

**Files:**
- Create: `SiteItemEntity.kt` (`Sites`), `SiteItemJpaRepository.kt`, DTOs `UpsertSiteRequest` / `SiteResponse`, use cases create/update/delete/list, `SiteController` (`/api/v1/sites`)
- Reuse: `LegacyBookAssetStorage.storeCover`, `storeBookFile`
- Test: `SiteCrudIT.kt` (+ assert delete não toca `tbl_books`)

- [ ] **Step 1: IT falhando**

```kotlin
@Test
fun `create site then delete does not touch tbl_books`() {
    val token = login("teste.admin", "Admin@123")
    val booksBefore = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tbl_books", Int::class.java)!!
    // inserir autor+categoria Site via JDBC se necessario para FKs logicas
    val body = """
      {
        "categoryIds": ["1"],
        "authorId": 1,
        "title": "IT Site ${System.currentTimeMillis()}",
        "description": "desc",
        "coverImage": "placeholder.jpg",
        "fileType": "server_url",
        "fileUrl": "https://example.com/a.pdf",
        "featured": "0",
        "status": "1"
      }
    """.trimIndent()
    val created = mockMvc.post("/api/v1/sites") {
        header("Authorization", "Bearer $token")
        contentType = MediaType.APPLICATION_JSON
        content = body
    }.andExpect { status { isCreated() } }.andReturn().response.contentAsString
    val id = objectMapper.readTree(created).path("id").asLong()
    mockMvc.delete("/api/v1/sites/$id") {
        header("Authorization", "Bearer $token")
    }.andExpect { status { isNoContent() } }
    val booksAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tbl_books", Int::class.java)!!
    assertEquals(booksBefore, booksAfter)
}
```

Ajustar `authorId`/`categoryIds` para IDs válidos criados no setup do teste (insert JDBC em `Autores_site` / categoria).

- [ ] **Step 2: FAIL → Entity**

```kotlin
@Entity
@Table(name = "Sites")
class SiteItemEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(name = "cat_id") val categoryIds: String,
    @Column(name = "aid") val authorId: Long,
    @Column(name = "book_title") val title: String,
    @Column(name = "book_description", columnDefinition = "LONGTEXT") val description: String,
    @Column(name = "book_cover_img") val coverImage: String,
    @Column(name = "book_file_type") val fileType: String,
    @Column(name = "book_file_url") val fileUrl: String,
    @Column(name = "featured") val featured: String = "0",
    @Column(name = "status") val status: String = "1",
    @Column(name = "total_rate") val totalRate: Int = 0,
    @Column(name = "rate_avg") val rateAvg: String = "0",
    @Column(name = "book_views") val views: Int = 0
)
```

Validações create: `categoryIds` não vazio, `authorId` > 0, title/description/cover não blank, `fileType` in `server_url|local`, URL ou arquivo conforme tipo.

**Delete:** hard ou soft conforme legado; ao remover, apagar só `Comentarios_site` / `rating_sites` / `vizualização_site` do `book_id` Site — **nunca** `tbl_books` / `tbl_comments`.

Uploads no controller:
- `POST /api/v1/sites/upload/cover`
- `POST /api/v1/sites/upload/file`

- [ ] **Step 3: PASS + commit**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.SiteCrudIT --no-daemon
git commit -m "feat(site): CRUD sites with safe cascade delete"
```

---

### Task 6: Comentários Site (admin)

**Files:**
- Create: `SiteCommentEntity.kt` (`Comentarios_site`), repo, `SiteCommentResponse`, `ListSiteCommentsUseCase`, `DeleteSiteCommentUseCase`, `SiteCommentController` (`/api/v1/site-comments`)
- Create: `SiteCommentPolicy.kt` (`sites.comments.view` / `sites.comments.moderate`)
- Test: `SiteCommentIT.kt`

- [ ] **Step 1: IT** — insert JDBC um comentário, GET lista com token, DELETE, assert row gone (ou status).

- [ ] **Step 2: Implement**

```kotlin
@Component
class SiteCommentPolicy(private val authorizationService: AuthorizationService) {
    fun requireView() = authorizationService.check("sites.comments.view")
    fun requireModerate() = authorizationService.check("sites.comments.moderate")
}
```

List: ordenar por id desc; response com `id`, `siteId`, `userName`, `commentText`, `commentOn`.  
Delete: `DELETE FROM Comentarios_site WHERE id = ?` (PHP incompleto — hard delete OK).

- [ ] **Step 3: PASS + commit**

```powershell
git commit -m "feat(site): list and delete site comments"
```

---

### Task 7: Espelho leitor `/api_sites.php`

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/modules/site/reader/GalileuEnvelope.kt`
- Create: `.../site/reader/ApiSitesDispatcher.kt`
- Create: `.../site/reader/ApiSitesController.kt`
- Create: `.../site/reader/SiteReaderQueries.kt` (JDBC ou reuso repos)
- Modify: `backend/src/main/kotlin/com/libare/adm/shared/security/SecurityConfig.kt`
- Test: `backend/src/test/kotlin/com/libare/adm/site/ApiSitesIT.kt`

- [ ] **Step 1: IT falhando**

```kotlin
@SpringBootTest
@AutoConfigureMockMvc
class ApiSitesIT {
    @Autowired lateinit var mockMvc: MockMvc

    @Test
    fun `home returns Galileu envelope without auth`() {
        val body = mockMvc.get("/api_sites.php") {
            param("method_name", "home")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        val root = ObjectMapper().readTree(body)
        assertTrue(root.has("Galileu"), "Envelope deve ser Galileu")
    }

    @Test
    fun `cat_list returns Galileu array`() {
        val body = mockMvc.get("/api_sites.php") {
            param("method_name", "cat_list")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue(ObjectMapper().readTree(body).has("Galileu"))
    }

    @Test
    fun `unknown method returns Galileu msg`() {
        val body = mockMvc.get("/api_sites.php") {
            param("method_name", "nao_existe")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        val arr = ObjectMapper().readTree(body).path("Galileu")
        assertTrue(arr.isArray && arr.size() > 0)
        assertTrue(arr[0].has("msg"))
    }
}
```

- [ ] **Step 2: FAIL (401)** — liberar rota em `SecurityConfig`:

```kotlin
it.requestMatchers("/api_sites.php").permitAll()
```

(Aceitar GET e POST.)

- [ ] **Step 3: Envelope + controller + dispatcher**

```kotlin
object GalileuEnvelope {
    fun wrap(payload: Any): Map<String, Any> = mapOf("Galileu" to payload)
}
```

```kotlin
@RestController
class ApiSitesController(
    private val dispatcher: ApiSitesDispatcher
) {
    @RequestMapping("/api_sites.php", method = [RequestMethod.GET, RequestMethod.POST])
    fun dispatch(
        @RequestParam(name = "method_name", required = false) methodName: String?,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val method = methodName?.trim().orEmpty()
        val result = dispatcher.dispatch(method, request)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "application/json; charset=utf-8")
            .body(result)
    }
}
```

`ApiSitesDispatcher.dispatch`: `when (method)` para cada method do spec. Portar SQL de `adm-libares/api_sites.php` method a method. URLs de imagem:

```kotlin
val base = publicBaseUrl.trimEnd('/')
"$base/legacy/assets/images/$filename"
```

(`publicBaseUrl` de `app.legacy.public-base-url`)

Ordem mínima para PASS dos ITs: `home`, `cat_list`, default unknown. Em seguida completar: `cat_id`, `author_list`, `author_id`, `latest`, `allbook`, `search_text`, `book_id`, `home_section`, `home_section_id`, `get_all_comments`, `removecomment`, `rating_check`, `continue_reading`, `con_reding_book`, `removeuser`, `delete_userdata`, `app_details`.

Para `app_details`, SELECT `tbl_settings` WHERE id=1 — campos iguais ao PHP (manter typo `interstital`).

- [ ] **Step 4: IT smoke PASS; estender com `book_id` se houver seed**

```powershell
.\gradlew.bat test --tests com.libare.adm.site.ApiSitesIT --no-daemon
```

- [ ] **Step 5: Commit**

```powershell
git commit -m "feat(site): mirror api_sites.php with Galileu envelope"
```

---

### Task 8: Frontend — grupo Site no React

**Files:**
- Modify: `frontend-admin/src/features/layout/config/navigation.ts`
- Modify: `frontend-admin/src/router.tsx`
- Create: `frontend-admin/src/types/site*.ts`, `services/siteAuthorsService.ts`, `siteCategoriesService.ts`, `siteSectionsService.ts`, `sitesService.ts`, `siteCommentsService.ts`
- Create: `frontend-admin/src/ui/pages/SitesPage.tsx`, `SiteAuthorsPage.tsx`, `SiteCategoriesPage.tsx`, `SiteSectionsPage.tsx`, `SiteCommentsPage.tsx`

- [ ] **Step 1: Nav group**

Em `NAV_GROUPS`, após `catalog`, inserir:

```typescript
{
  id: "site",
  label: "Site",
  collapsible: true,
  defaultExpanded: false,
  items: [
    {
      id: "sites",
      to: "/sites",
      label: "Sites",
      icon: Globe, // import de lucide-react
      permission: "sites.view",
      keywords: ["site", "web"]
    },
    {
      id: "site-authors",
      to: "/sites/autores",
      label: "Autores",
      icon: Pencil,
      permission: "sites.view"
    },
    {
      id: "site-categories",
      to: "/sites/categorias",
      label: "Categorias",
      icon: Tags,
      permission: "sites.view"
    },
    {
      id: "site-sections",
      to: "/sites/secoes",
      label: "Seções",
      icon: LayoutList,
      permission: "sites.view"
    },
    {
      id: "site-comments",
      to: "/sites/comentarios",
      label: "Comentários",
      icon: MessageSquareText,
      permission: "sites.comments.view"
    }
  ]
}
```

Estender `NavBadgeKey` se badges forem usados (opcional nesta entrega).

- [ ] **Step 2: Router**

Lazy imports + rotas:

```tsx
<Route path="/sites" element={<GuardedPage path="/sites" element={<SitesPage />} />} />
<Route path="/sites/autores" element={<GuardedPage path="/sites/autores" element={<SiteAuthorsPage />} />} />
<Route path="/sites/categorias" element={<GuardedPage path="/sites/categorias" element={<SiteCategoriesPage />} />} />
<Route path="/sites/secoes" element={<GuardedPage path="/sites/secoes" element={<SiteSectionsPage />} />} />
<Route path="/sites/comentarios" element={<GuardedPage path="/sites/comentarios" element={<SiteCommentsPage />} />} />
```

- [ ] **Step 3: Services**

Exemplo `siteAuthorsService.ts`:

```typescript
import { apiRequest, apiUploadForm } from "../lib/api";
import type { SiteAuthorResponse, UpsertSiteAuthorRequest, SiteAuthorImageUploadResponse } from "../types/siteAuthors";

export function listSiteAuthors(): Promise<SiteAuthorResponse[]> {
  return apiRequest<SiteAuthorResponse[]>("/api/v1/site-authors");
}
export function createSiteAuthor(payload: UpsertSiteAuthorRequest) {
  return apiRequest<SiteAuthorResponse>("/api/v1/site-authors", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
export function updateSiteAuthor(id: number, payload: UpsertSiteAuthorRequest) {
  return apiRequest<SiteAuthorResponse>(`/api/v1/site-authors/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
export function deleteSiteAuthor(id: number) {
  return apiRequest<void>(`/api/v1/site-authors/${id}`, { method: "DELETE" });
}
export function uploadSiteAuthorImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<SiteAuthorImageUploadResponse>("/api/v1/site-authors/upload/image", formData);
}
```

Repetir para categories/sections/sites/comments apontando para `/api/v1/site-categories`, `/site-sections`, `/sites`, `/site-comments`.

- [ ] **Step 4: Pages**

Copiar estrutura Berry de `AuthorsPage.tsx` / `BooksPage.tsx` / `CommentsPage.tsx` / `HomeSectionsPage.tsx` / `CategoriesPage.tsx`, trocando services e removendo qualquer filtro de acervo. SitesPage: form com multi-categoria, autor Site, capa, tipo arquivo URL|local.

- [ ] **Step 5: Build FE**

```powershell
cd "C:\Users\User\Repository\Restruturacao ´Projeto PhP\frontend-admin"
npm run build
```

Expected: success

- [ ] **Step 6: Commit**

```powershell
git add frontend-admin
git commit -m "feat(admin): Site menu and CRUD pages"
```

---

### Task 9: Verificação final + docs

- [ ] **Step 1: Suite Site**

```powershell
cd "C:\Users\User\Repository\Restruturacao ´Projeto PhP\backend"
.\gradlew.bat test --tests com.libare.adm.site.* --no-daemon
```

Expected: todos PASS

- [ ] **Step 2: Smoke manual**

1. Login painel → menu Site visível (super-admin).
2. Criar autor/categoria/site; listar; soft-delete.
3. `Invoke-RestMethod "http://localhost:8080/api_sites.php?method_name=home"` → JSON com chave `Galileu`.
4. Confirmar DELETE site não reduz `COUNT(*)` em `tbl_books`.

- [ ] **Step 3: Atualizar status do spec**

Em `docs/superpowers/specs/2026-07-23-site-module-design.md`:

```markdown
**Status:** Implementado — ver plano `docs/superpowers/plans/2026-07-23-site-module.md`
```

Marcar critérios de aceite do spec com `[x]` quando verificados.

- [ ] **Step 4: Commit**

```powershell
git add docs/superpowers/specs/2026-07-23-site-module-design.md
git commit -m "docs(site): mark site module spec implemented"
```

---

## Self-review do plano (vs spec)

| Requisito spec | Task |
|----------------|------|
| `modules/site/` domínio único | 2–7 |
| Global / sem tenant | 2–6 (sem school filter) |
| `sites.*` + escola sem sites | 1 |
| Admin REST paths | 2–6 |
| Cascata delete segura | 5 |
| Envelope `Galileu` + methods | 7 |
| React grupo Site | 8 |
| IT admin + ApiSitesIT | 2–7, 9 |
| Fora: api.php, jogos, etc. | não incluídos |

---

## Ordem sugerida de execução

Task 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

Admin (2–6) desbloqueia o painel; leitor (7) desbloqueia cutover Flutter; FE (8) pode começar em paralelo após Task 2 se houver dois agentes.
