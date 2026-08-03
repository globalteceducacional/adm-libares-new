# APIs do leitor (espelho PHP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor no Spring as rotas legado do leitor (`/api.php`, `user_*.php`, `/api_sites.php`) com envelope `EBOOK_APP`, senha upgrade-on-login e assets via `/legacy/assets`, para o Flutter só trocar o host e o PHP do ebook/site poder ser desligado.

**Architecture:** Módulo `modules/reader/` na borda HTTP: controllers com paths `.php`, dispatcher por `method_name`, envelope JSON legado, JDBC/JPA nas tabelas `tbl_*` / Site. Sem JWT admin nas rotas do leitor. Reusa `PasswordEncoder` (BCrypt), `LegacyBookAssetStorage`/`public-base-url`, e filtragem de acervo como no PHP (`livros_acervos` + `user_id`/`acervo_id`).

**Tech Stack:** Kotlin / Spring Boot 3.3 / Spring Security / JPA + JdbcTemplate / MySQL legado / MockMvc ITs (`@SpringBootTest`)

**Spec:** `docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md`

**Fonte PHP canónica:** `C:\Users\User\Repository\adm-projeto\adm-libares\` (`api.php`, `api_sites.php`, `user_*.php`, `language/app_language.php`)

**Pré-requisitos locais:** MySQL `adm_libare`, junction `C:\Users\User\Repository\adm-projeto`, env via `scripts/local/dev.local.ps1`, backend `:8080`, `LEGACY_ASSETS_ROOT` apontando para `adm-libares`.

**Convenção de commit (PowerShell):** usar `git commit -m "mensagem"` (sem heredoc bash).

---

## Mapa de arquivos

| Área | Criar | Modificar |
|------|-------|-----------|
| Security | — | `SecurityConfig.kt` (permitAll rotas leitor) |
| Envelope / URLs | `EbookAppEnvelope.kt`, `LegacyAssetUrlBuilder.kt`, `ReaderLang.kt` | — |
| Senha | `ReaderPasswordService.kt` | — |
| Auth HTTP | `UserLoginController.kt`, `UserRegisterController.kt`, `UserRegisterGalileuController.kt`, `UserForgotPassController.kt`, `UserProfileController.kt`, `UserProfileUpdateController.kt` | `UserJpaRepository.kt` (finders) |
| Auth app | `ReaderLoginUseCase.kt`, `ReaderRegisterUseCase.kt`, `ReaderProfileUseCases.kt`, `ReaderForgotPasswordUseCase.kt`, `ReaderActiveLogService.kt` | — |
| Dispatcher ebook | `ApiPhpController.kt`, `ApiPhpDispatcher.kt` | — |
| Catalogo reader | `ReaderCatalogQueries.kt` (JDBC), `ReaderHomeUseCase.kt`, `ReaderBookQueryUseCases.kt`, `ReaderSectionUseCases.kt`, mappers | reusar entities existentes quando couber |
| Social/leitura | `ReaderSocialUseCases.kt`, `ReaderReadingUseCases.kt` + entities/repos mínimas se necessário | — |
| App details | `ReaderAppDetailsUseCase.kt`, `SettingsEntity` / JDBC `tbl_settings` | — |
| Sites | `ApiSitesController.kt`, `ApiSitesDispatcher.kt`, JDBC Site | — |
| Tests | `reader/ReaderPasswordServiceTest.kt`, `reader/UserLoginIT.kt`, `reader/ApiPhpCatalogIT.kt`, `reader/ApiPhpSocialIT.kt`, `reader/ApiSitesIT.kt` | — |
| Ops | `docs/.../cutover-checklist` opcional no Task 12 | — |

**Envelope importante:**
- Maioria: `{ "EBOOK_APP": [ {...}, ... ] }` (array)
- **Exceção `home`:** `{ "EBOOK_APP": { "featured_books":[], "latest_books":[], "popular_books":[] } }` (objeto) — ver `api.php` ~L232

**Tabelas ebook usadas em `api.php`:** `tbl_books`, `tbl_category`, `tbl_author`, `tbl_home_section`, `tbl_comments`, `tbl_rating`, `tbl_favourite`, `tbl_wishlist`, `tbl_reading`, `tbl_book_page_notes`, `tbl_users`, `tbl_settings`, `livros_acervos`, `tbl_active_log`

**Tabelas site (`api_sites.php`):** descobrir nomes exactos no MySQL com encoding (`SHOW TABLES LIKE '%site%'` / `LIKE 'Sites'`) — tipicamente `Sites`, `Autores_site`, categoria/seção/comentários/rating/visualização site.

---

### Task 1: Security + envelope + asset URL + senha

**Files:**
- Modify: `backend/src/main/kotlin/com/libare/adm/shared/security/SecurityConfig.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/api/EbookAppEnvelope.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/application/LegacyAssetUrlBuilder.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/application/ReaderPasswordService.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/application/ReaderLang.kt`
- Test: `backend/src/test/kotlin/com/libare/adm/reader/ReaderPasswordServiceTest.kt`

- [x] **Step 1: Teste unitário de senha (falha primeiro — classe inexistente)**

```kotlin
package com.libare.adm.reader

import com.libare.adm.modules.reader.application.ReaderPasswordService
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

class ReaderPasswordServiceTest {
    private val encoder = BCryptPasswordEncoder()
    private val service = ReaderPasswordService(encoder)

    @Test
    fun `plaintext match should upgrade`() {
        val r = service.verifyAndDecideUpgrade(stored = "Admin@123", raw = "Admin@123")
        assertTrue(r.matches)
        assertTrue(r.needsUpgrade)
    }

    @Test
    fun `bcrypt match should not upgrade`() {
        val hash = encoder.encode("Admin@123")
        val r = service.verifyAndDecideUpgrade(stored = hash, raw = "Admin@123")
        assertTrue(r.matches)
        assertFalse(r.needsUpgrade)
    }

    @Test
    fun `wrong password fails`() {
        val r = service.verifyAndDecideUpgrade(stored = "x", raw = "y")
        assertFalse(r.matches)
    }
}
```

- [x] **Step 2: Rodar teste — espera falha de compilação/classe ausente**

```powershell
cd C:\Users\User\Repository\adm-projeto\backend
. "C:\Users\User\Repository\Restruturacao ´Projeto PhP\scripts\local\dev.local.ps1"
$env:DB_PASSWORD = $script:DevDbPassword
.\gradlew.bat test --tests com.libare.adm.reader.ReaderPasswordServiceTest --no-daemon
```

Expected: FAIL (classe/pacote não encontrado)

- [x] **Step 3: Implementar `ReaderPasswordService`**

```kotlin
package com.libare.adm.modules.reader.application

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

data class PasswordVerifyResult(val matches: Boolean, val needsUpgrade: Boolean)

@Service
class ReaderPasswordService(
    private val passwordEncoder: PasswordEncoder
) {
    fun verifyAndDecideUpgrade(stored: String, raw: String): PasswordVerifyResult {
        if (stored.isBlank()) return PasswordVerifyResult(false, false)
        // Hash moderno (BCrypt $2*, Argon2, etc.)
        if (looksHashed(stored)) {
            val ok = passwordEncoder.matches(raw, stored)
            // Se for Argon2 e passou, ainda assim upgradear para BCrypt do projeto
            val needsUpgrade = ok && !stored.startsWith("\$2")
            return PasswordVerifyResult(ok, needsUpgrade)
        }
        // Plaintext legado
        val ok = stored == raw
        return PasswordVerifyResult(ok, needsUpgrade = ok)
    }

    fun encode(raw: String): String = passwordEncoder.encode(raw)

    private fun looksHashed(stored: String): Boolean =
        stored.startsWith("\$2") ||
            stored.startsWith("\$argon2") ||
            stored.startsWith("{bcrypt}") ||
            stored.startsWith("{argon2}")
}
```

- [x] **Step 4: `EbookAppEnvelope` + `LegacyAssetUrlBuilder` + `ReaderLang`**

`EbookAppEnvelope.kt`:

```kotlin
package com.libare.adm.modules.reader.api

object EbookAppEnvelope {
    fun array(items: List<Any>): Map<String, Any> = mapOf("EBOOK_APP" to items)
    fun arrayOne(item: Map<String, Any?>): Map<String, Any> = array(listOf(item))
    /** home: objeto, não lista */
    fun obj(payload: Map<String, Any?>): Map<String, Any> = mapOf("EBOOK_APP" to payload)
}
```

`LegacyAssetUrlBuilder.kt`:

```kotlin
package com.libare.adm.modules.reader.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class LegacyAssetUrlBuilder(
    @Value("\${app.legacy.public-base-url:http://localhost:8080}") private val publicBaseUrl: String
) {
    private val base get() = publicBaseUrl.trim().removeSuffix("/")

    fun images(filename: String?): String {
        if (filename.isNullOrBlank()) return "$base/legacy/assets/images/add-image.png"
        if (filename.startsWith("http://") || filename.startsWith("https://")) return filename
        return "$base/legacy/assets/images/$filename"
    }

    fun imageThumb(filename: String?): String {
        if (filename.isNullOrBlank()) return images(null)
        return "$base/legacy/assets/images/thumbs/$filename"
    }

    fun uploads(filenameOrUrl: String?): String {
        if (filenameOrUrl.isNullOrBlank()) return ""
        if (filenameOrUrl.startsWith("http://") || filenameOrUrl.startsWith("https://")) return filenameOrUrl
        return "$base/legacy/assets/uploads/$filenameOrUrl"
    }
}
```

`ReaderLang.kt` (mensagens alinhadas a `language/app_language.php` + strings hardcoded do `api.php`):

```kotlin
package com.libare.adm.modules.reader.application

object ReaderLang {
    const val LOGIN_SUCCESS = "Login successfully."
    const val INVALID_PASSWORD = "Password is invalid !"
    const val EMAIL_NOT_FOUND = "Email is not found !"
    const val ACCOUNT_DEACTIVE = "Sorry ! Your account is suspended"
    const val USER_DELETED = "Your user is deleted"
    const val REGISTER_SUCCESS = "Register successflly...!"
    const val FORGOT_SENT = "Password has been sent on your mail!"
    const val FORGOT_NOT_FOUND = "Email not found in our database!"
    const val FORGOT_SENT_SECURE =
        "If this email exists, a password reset instruction has been sent."
}
```

- [x] **Step 5: Abrir rotas do leitor no `SecurityConfig`**

Dentro de `authorizeHttpRequests`, **antes** de `anyRequest().authenticated()`:

```kotlin
it.requestMatchers(
    "/api.php",
    "/api_sites.php",
    "/user_login_api.php",
    "/user_register_api.php",
    "/user_register_galileu.php",
    "/user_forgot_pass_api.php",
    "/user_profile_api.php",
    "/user_profile_update_api.php"
).permitAll()
```

- [x] **Step 6: Rodar unit test — PASS**

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.ReaderPasswordServiceTest --no-daemon
```

Expected: `BUILD SUCCESSFUL`, testes PASS

- [x] **Step 7: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/shared/security/SecurityConfig.kt `
  backend/src/main/kotlin/com/libare/adm/modules/reader `
  backend/src/test/kotlin/com/libare/adm/reader/ReaderPasswordServiceTest.kt
git commit -m "feat(reader): envelope, asset URLs, password upgrade and public routes"
```

---

### Task 2: Login Normal com upgrade-on-login

**Files:**
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/users/infrastructure/persistence/repository/UserJpaRepository.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/application/ReaderActiveLogService.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/application/ReaderLoginUseCase.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/modules/reader/api/UserLoginController.kt`
- Test: `backend/src/test/kotlin/com/libare/adm/reader/UserLoginIT.kt`

- [ ] **Step 1: IT falhando — login plaintext faz upgrade**

```kotlin
package com.libare.adm.reader

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class UserLoginIT {
    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var jdbc: JdbcTemplate
    private val mapper = ObjectMapper()
    private val emails = mutableListOf<String>()

    @AfterEach
    fun tearDown() {
        emails.forEach { e ->
            jdbc.update("DELETE FROM tbl_active_log WHERE user_id IN (SELECT id FROM tbl_users WHERE email = ?)", e)
            jdbc.update("DELETE FROM tbl_users WHERE email = ?", e)
        }
        emails.clear()
    }

    @Test
    fun `normal login upgrades plaintext password`() {
        val email = "it.reader.login.${System.currentTimeMillis()}@local.dev"
        emails += email
        jdbc.update(
            """
            INSERT INTO tbl_users
              (name, email, password, phone, user_type, user_image, auth_id, is_deleted, registered_on, status)
            VALUES (?, ?, ?, ?, 'Normal', NULL, '', 0, ?, '1')
            """.trimIndent(),
            "IT Reader", email, "PlainPass1", "11999990000", System.currentTimeMillis().toString()
        )

        val body = mockMvc.get("/user_login_api.php") {
            param("email", email)
            param("password", "PlainPass1")
            param("type", "Normal")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val root = mapper.readTree(body)
        val item = root.path("EBOOK_APP").path(0)
        assertEquals("1", item.path("success").asText())
        assertTrue(item.path("user_id").asLong() > 0)

        val stored = jdbc.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )!!
        assertTrue(stored.startsWith("\$2"), "deve ter virado BCrypt")
    }
}
```

- [ ] **Step 2: Rodar IT — FAIL (404 ou sem mapping)**

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.UserLoginIT --no-daemon
```

Expected: FAIL

- [ ] **Step 3: Repository finders**

Em `UserJpaRepository` adicionar:

```kotlin
fun findByEmailIgnoreCaseAndUserTypeIgnoreCase(email: String, userType: String): UserEntity?
fun findByEmailIgnoreCase(email: String): UserEntity?
fun findFirstByEmailIgnoreCaseOrAuthIdAndUserTypeIgnoreCase(
    email: String,
    authId: String,
    userType: String
): UserEntity?
```

(Se derived query do OR ficar ambígua, usar `@Query` JPQL explícita — preferível:)

```kotlin
@Query(
    """
    SELECT u FROM UserEntity u
    WHERE (LOWER(u.email) = LOWER(:email) OR u.authId = :authId)
      AND LOWER(u.userType) = LOWER(:userType)
    """
)
fun findSocialCandidate(
    @Param("email") email: String,
    @Param("authId") authId: String,
    @Param("userType") userType: String
): UserEntity?
```

- [ ] **Step 4: Active log + Login use case + controller**

`ReaderActiveLogService.kt` — upsert em `tbl_active_log` via JdbcTemplate (`user_id`, `date_time` = epoch seconds), espelhando `user_login_api.php`.

`ReaderLoginUseCase.kt` (Normal):

```kotlin
@Service
class ReaderLoginUseCase(
    private val users: UserJpaRepository,
    private val passwords: ReaderPasswordService,
    private val urls: LegacyAssetUrlBuilder,
    private val activeLog: ReaderActiveLogService
) {
    @Transactional
    fun loginNormal(email: String, password: String): Map<String, Any> {
        val user = users.findByEmailIgnoreCaseAndUserTypeIgnoreCase(email, "Normal")
            ?: return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.EMAIL_NOT_FOUND, "success" to "0")
            )
        if (user.status != "1") {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.ACCOUNT_DEACTIVE, "success" to "0")
            )
        }
        if (user.isDeleted != 0) {
            return EbookAppEnvelope.arrayOne(userPayload(user, ReaderLang.USER_DELETED, "0"))
        }
        val verified = passwords.verifyAndDecideUpgrade(user.password, password)
        if (!verified.matches) {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.INVALID_PASSWORD, "success" to "0")
            )
        }
        if (verified.needsUpgrade) {
            users.save(
                UserEntity(
                    id = user.id,
                    name = user.name,
                    email = user.email,
                    password = passwords.encode(password),
                    phone = user.phone,
                    userType = user.userType,
                    userImage = user.userImage,
                    authId = user.authId,
                    isDeleted = user.isDeleted,
                    registeredOn = user.registeredOn,
                    acervoId = user.acervoId,
                    schoolId = user.schoolId,
                    status = user.status
                )
            )
        }
        activeLog.touch(user.id)
        return EbookAppEnvelope.arrayOne(userPayload(user, ReaderLang.LOGIN_SUCCESS, "1"))
    }

    private fun userPayload(user: UserEntity, msg: String, success: String): Map<String, Any?> =
        mapOf(
            "user_id" to user.id,
            "name" to user.name,
            "user_image" to urls.images(user.userImage),
            "email" to user.email,
            "phone" to user.phone,
            "MSG" to msg,
            "auth_id" to "",
            "success" to success
        )
}
```

`UserLoginController.kt`:

```kotlin
@RestController
class UserLoginController(private val login: ReaderLoginUseCase) {
    @RequestMapping(value = ["/user_login_api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun login(
        @RequestParam email: String?,
        @RequestParam password: String?,
        @RequestParam(name = "type") userType: String?,
        @RequestParam(name = "auth_id", required = false) authId: String?
    ): Map<String, Any> {
        val type = userType?.trim().orEmpty()
        return when {
            type.equals("normal", ignoreCase = true) ->
                login.loginNormal(email.orEmpty(), password.orEmpty())
            type.equals("google", ignoreCase = true) ->
                login.loginSocial(email.orEmpty(), authId.orEmpty(), "Google")
            type.equals("facebook", ignoreCase = true) ->
                login.loginSocial(email.orEmpty(), authId.orEmpty(), "Facebook")
            else -> EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.EMAIL_NOT_FOUND, "success" to "0")
            )
        }
    }
}
```

Implementar `loginSocial` espelhando ramos Google/Facebook de `user_login_api.php` (sem senha; match email/auth_id; touch active log; mesmas chaves de sucesso).

- [ ] **Step 5: Rodar IT — PASS** (+ um teste rápido BCrypt ok no mesmo arquivo)

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.UserLoginIT --no-daemon
```

Expected: PASS

- [ ] **Step 6: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/reader `
  backend/src/main/kotlin/com/libare/adm/modules/users/infrastructure/persistence/repository/UserJpaRepository.kt `
  backend/src/test/kotlin/com/libare/adm/reader/UserLoginIT.kt
git commit -m "feat(reader): mirror user_login_api with password upgrade"
```

---

### Task 3: Register, perfil, forgot-password, galileu

**Files:**
- Create: `ReaderRegisterUseCase.kt`, `ReaderProfileUseCases.kt`, `ReaderForgotPasswordUseCase.kt`
- Create: controllers `UserRegisterController`, `UserRegisterGalileuController`, `UserProfileController`, `UserProfileUpdateController`, `UserForgotPassController`
- Extend: `UserLoginIT` ou `UserRegisterIT` / `UserProfileIT`

**Contrato register (`user_register_api.php`):** GET query `type`, `email`, `auth_id`, `name`, `password`, `phone`, `user_image`. Normal: inserir com **password já hasheada** (`passwords.encode`). Google/Facebook: insert ou update `auth_id` se já existir. Resposta: `user_id`, `name`, `email`, `user_image`, `success`, `MSG`, `auth_id`.

**Perfil:** GET `id` → `user_id`, `name`, `user_image` (URL absoluta ou externa social), `email`, `phone`, `success`.

**Profile update:** GET/POST `user_id`, `name`, `email`, `password` (se não vazio → hash), `phone`; upload de imagem se multipart (gravar em `images/` via `LegacyBookAssetStorage.storeCatalogImage`).

**Forgot (desvio de segurança vs PHP):** Nunca enviar senha em claro. Gerar senha temporária aleatória, gravar BCrypt, enviar e-mail se SMTP estiver configurado; se e-mail não configurado em dev, ainda assim atualizar hash e devolver sucesso compatível. Resposta PHP usa chave **`msg`** (minúsculo): sucesso `Password has been sent on your mail!` / falha `Email not found...`. Em dev sem mail: manter mesma chave `msg`/`success` e logar a ação; **não** colocar a senha no JSON.

**Galileu:** `UserRegisterGalileuController` em `/user_register_galileu.php` delega ao mesmo `ReaderRegisterUseCase` (arquivo PHP é variant do register).

- [ ] **Step 1: IT register Normal cria BCrypt + login funciona**

```kotlin
@Test
fun `register normal hashes password and login works`() {
    val email = "it.reader.reg.${System.currentTimeMillis()}@local.dev"
    emails += email
    mockMvc.get("/user_register_api.php") {
        param("type", "Normal")
        param("name", "Reg User")
        param("email", email)
        param("password", "Secret@123")
        param("phone", "11988887777")
        param("auth_id", "")
    }.andExpect { status { isOk() } }

    val hash = jdbc.queryForObject("SELECT password FROM tbl_users WHERE email = ?", String::class.java, email)!!
    assertTrue(hash.startsWith("\$2"))

    mockMvc.get("/user_login_api.php") {
        param("email", email)
        param("password", "Secret@123")
        param("type", "Normal")
        param("auth_id", "")
    }.andExpect { status { isOk() } }
}
```

- [ ] **Step 2: Implementar use cases + controllers; rodar ITs**

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.UserLoginIT --tests com.libare.adm.reader.UserRegisterIT --no-daemon
```

Expected: PASS

- [ ] **Step 3: Commit**

```powershell
git commit -m "feat(reader): mirror register, profile and forgot-password APIs"
```

---

### Task 4: Dispatcher `/api.php` + method desconhecido

**Files:**
- Create: `ApiPhpController.kt`, `ApiPhpDispatcher.kt`
- Test: `ApiPhpCatalogIT.kt` (caso unknown + smoke cat_list quando Task 5)

- [ ] **Step 1: Controller**

```kotlin
@RestController
class ApiPhpController(private val dispatcher: ApiPhpDispatcher) {
    @RequestMapping(value = ["/api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun dispatch(request: HttpServletRequest): Map<String, Any> {
        val params = request.parameterMap.mapValues { (_, v) -> v.firstOrNull().orEmpty() }
        val method = params["method_name"].orEmpty().ifBlank {
            // alguns clients antigos: ?home em vez de method_name=home (api_urls mistura os dois)
            params.keys.firstOrNull { it in ApiPhpDispatcher.KNOWN && params[it] != null }.orEmpty()
        }
        return dispatcher.dispatch(method.ifBlank { guessFlagMethod(params) }, params)
    }

    private fun guessFlagMethod(params: Map<String, String>): String =
        ApiPhpDispatcher.KNOWN.firstOrNull { params.containsKey(it) && params[it] == "" }.orEmpty()
}
```

Na prática o app Flutter usa `method_name` (ver `api_urls` e código Flutter). Preferir só `method_name`; se vier vazio, resposta de fallback do PHP:

```kotlin
EbookAppEnvelope.arrayOne(
    mapOf("msg" to "Acesso negado ou dados nao encontrados", "success" to "1")
)
```

(Nota: PHP usa `success => '1'` nesse fallback — manter paridade.)

- [ ] **Step 2: Dispatcher stub com KNOWN set**

Lista canónica de `api.php`:

```kotlin
val KNOWN = setOf(
    "home", "latest", "allbook", "search_text",
    "cat_list", "cat_id", "author_list", "author_id", "book_id",
    "home_section", "home_section_id",
    "add_comment", "get_all_comments", "removecomment",
    "submit_rating", "rating_check",
    "toggle_favourite", "favourite_list",
    "toggle_wishlist", "wishlist_list",
    "book_page_state_list", "book_page_state_save",
    "continue_reading", "con_reding_book",
    "removeuser", "delete_userdata", "app_details"
)
```

Até as Tasks 5–7, métodos não implementados podem devolver o mesmo fallback (ou `NotImplemented` só em profile `local` — **não** em produção). Preferência: implementar na mesma PR da Task correspondente; dispatcher só roteia.

- [ ] **Step 3: IT unknown method**

```kotlin
@Test
fun `unknown method_name returns legacy fallback`() {
    val body = mockMvc.get("/api.php") {
        param("method_name", "nao_existe")
    }.andExpect { status { isOk() } }.andReturn().response.contentAsString
    val item = ObjectMapper().readTree(body).path("EBOOK_APP").path(0)
    assertEquals("1", item.path("success").asText())
}
```

- [ ] **Step 4: Commit**

```powershell
git commit -m "feat(reader): add api.php dispatcher shell"
```

---

### Task 5: Catálogo ebook (home, lists, book_id, sections, search)

**Files:**
- Create: `ReaderAcervoFilter.kt` (espelha `add_acervo_filter` / `get_user_acervo_id` do PHP)
- Create: `ReaderBookRowMapper.kt` (campos comuns de livro+autor+cat)
- Create: use cases por grupo: `ReaderHomeUseCase`, `ReaderCatalogListUseCases`, `ReaderBookDetailUseCase`, `ReaderHomeSectionUseCases`
- Preferir **JdbcTemplate** para queries com `LIKE`/`FIND_IN_SET`/joins CSV (fiel ao PHP)
- Test: `ApiPhpCatalogIT.kt`

**Filtro acervo (obrigatório onde PHP aplica):**
1. Se `user_id` → `SELECT acervo_id FROM tbl_users WHERE id=?`
2. Ou `acervo_id` query param
3. Se presente: `AND tbl_books.id IN (SELECT book_id FROM livros_acervos WHERE acervo_id = ?)`

**`home` (api.php L95–235):** objeto com:
- `featured_books` — `featured=1`
- `latest_books`
- `popular_books`  
Campos por livro: `id`, `cat_id` (**array** via split `,`), `aid`, `book_title`, `book_cover_img`, `book_file_type`, `book_file_url`, `book_description`, `total_rate`, `rate_avg`, `book_views`, `author_id`, `author_name`, `author_description`, `cid`, `category_name`, `category_image` (URL), `category_image_thumb` (URL).  
URLs de capa: no PHP `home` a capa às vezes vai relativa — no espelho Kotlin **padronizar** capa/arquivo com `LegacyAssetUrlBuilder` quando não for http (Flutter já trata URLs absolutas).

**Demais methods — portar SQL/campos das linhas do PHP:**

| method | Linhas aprox. `api.php` | Notas |
|--------|-------------------------|-------|
| `cat_list` | 237–271 | total_books via `get_total_books` + acervo |
| `cat_id` | 567–624 | livros da categoria |
| `author_list` | 630–669 | |
| `author_id` | 674–731 | |
| `latest` | 737–790 | |
| `allbook` | 796–851 | |
| `search_text` | 857–912 | |
| `book_id` | 917–1069 | incrementa views; detalhe completo |
| `home_section` | 453–494 | |
| `home_section_id` | 367–446 | `get_all_book_ids_for_section_api` |

- [ ] **Step 1: IT `cat_list` e `home` retornam chave `EBOOK_APP`**

```kotlin
@Test
fun `cat_list returns EBOOK_APP array`() {
    val body = mockMvc.get("/api.php") { param("method_name", "cat_list") }
        .andExpect { status { isOk() } }.andReturn().response.contentAsString
    assertTrue(ObjectMapper().readTree(body).has("EBOOK_APP"))
}

@Test
fun `home returns object with featured_books`() {
    val body = mockMvc.get("/api.php") { param("method_name", "home") }
        .andExpect { status { isOk() } }.andReturn().response.contentAsString
    val ebook = ObjectMapper().readTree(body).path("EBOOK_APP")
    assertTrue(ebook.isObject)
    assertTrue(ebook.has("featured_books"))
    assertTrue(ebook.has("latest_books"))
    assertTrue(ebook.has("popular_books"))
}
```

- [ ] **Step 2: Implementar filtro acervo + home + catálogo + sections; ligar no dispatcher**

Ao portar cada method: abrir o bloco PHP correspondente e copiar a lógica de SELECT/ORDER/LIMIT; montar `MutableMap<String, Any?>` com **mesmos nomes de chave**.

- [ ] **Step 3: Rodar ITs**

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.ApiPhpCatalogIT --no-daemon
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git commit -m "feat(reader): mirror api.php catalog and home_section methods"
```

---

### Task 6: Social + leitura (comments, ratings, fav, wishlist, continue, page state)

**Files:**
- Create: entities/repos mínimas ou JDBC para `tbl_comments`, `tbl_rating`, `tbl_favourite`, `tbl_wishlist`, `tbl_reading`, `tbl_book_page_notes`
- Create: `ReaderSocialUseCases.kt`, `ReaderReadingUseCases.kt`
- Test: `ApiPhpSocialIT.kt`

| method | Linhas | Comportamento |
|--------|--------|----------------|
| `add_comment` | 300–340 | params `book_id`, `user_id`, `comment_text`; busca user; insert |
| `get_all_comments` | 1075–1117 | |
| `removecomment` | 277–295 | `comment_id` |
| `submit_rating` / `rating_check` | 500–560 | |
| `toggle_favourite` / `favourite_list` | 1123–1196 | |
| `toggle_wishlist` / `wishlist_list` | 1304–1372 | espelho do favourite |
| `book_page_state_list` / `_save` | 1198–1300 | tabela `tbl_book_page_notes` |
| `continue_reading` / `con_reding_book` | 1377–1491 | typo `con_reding` **manter** |
| `removeuser` / `delete_userdata` | 344–360, 1497–1515 | soft-delete / limpeza conforme PHP |

- [ ] **Step 1: IT toggle_favourite round-trip**

```kotlin
@Test
fun `toggle_favourite add and remove`() {
    // seed user_id + book_id válidos do DB de dev, ou INSERT mínimo
    mockMvc.get("/api.php") {
        param("method_name", "toggle_favourite")
        param("user_id", userId.toString())
        param("book_id", bookId.toString())
    }.andExpect { status { isOk() } }

    val list = mockMvc.get("/api.php") {
        param("method_name", "favourite_list")
        param("user_id", userId.toString())
    }.andReturn().response.contentAsString
    assertTrue(list.contains(bookId.toString()) || list.contains("\"book_id\""))
}
```

- [ ] **Step 2: Implementar todos os methods da tabela; limpar dados de teste no `@AfterEach`**

- [ ] **Step 3: Rodar ITs + regressão login/catalog**

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.* --no-daemon
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git commit -m "feat(reader): mirror comments ratings favourites wishlist and reading state"
```

---

### Task 7: `app_details` + `api_sites.php`

**Files:**
- Create: `ReaderAppDetailsUseCase.kt` (SELECT `tbl_settings` WHERE id=1 — campos listados na spec/api.php L1529–1552)
- Create: `ApiSitesController.kt`, `ApiSitesDispatcher.kt`, JDBC Site
- Test: `ApiSitesIT.kt`, extender `ApiPhpCatalogIT` para `app_details`

**`app_details` keys:**  
`app_name`, `onesignal_rest_key`, `onesignal_app_id`, `app_logo`, `app_version`, `app_author`, `app_contact`, `app_email`, `app_website`, `app_description`, `publisher_id`, `interstital_ad_id`, `interstital_ad_id_status`, `banner_ad_id`, `banner_ad_id_status`, `interstital_ad_id_ios`, `interstital_ad_id_ios_status`, `banner_ad_id_ios`, `banner_ad_id_ios_status`, `app_open_ad_id`, `app_open_ad_id_status`, `ios_app_open_ad_id`, `ios_app_open_ad_id_status`, `app_privacy_policy`  
(Typos `interstital` **manter**.)

**Sites methods em `api_sites.php`:**  
`home`, `cat_list`, `cat_id`, `author_list`, `author_id`, `latest`, `allbook`, `search_text`, `book_id`, `home_section`, `home_section_id`, `get_all_comments`, `removecomment`, `removeuser`, `rating_check`, `continue_reading`, `con_reding_book`, `delete_userdata`, `app_details`  
(+ ramos `user_type` Google/Facebook embutidos no ficheiro — cobrir se o app Site os chama)

Antes de mapear entities:

```powershell
# com MySQL local
mysql -uroot -padmin -e "SHOW TABLES FROM adm_libare LIKE '%site%'; SHOW TABLES FROM adm_libare LIKE 'Sites';"
```

Usar os nomes **exatos** retornados (encoding Latin1/utf8) nas queries JDBC com backticks.

- [ ] **Step 1: IT `app_details` tem `app_name`**

```kotlin
@Test
fun `app_details contains app_name`() {
    val body = mockMvc.get("/api.php") { param("method_name", "app_details") }
        .andExpect { status { isOk() } }.andReturn().response.contentAsString
    val arr = ObjectMapper().readTree(body).path("EBOOK_APP")
    assertTrue(arr.isArray && arr.size() > 0)
    assertTrue(arr[0].has("app_name"))
}
```

- [ ] **Step 2: Implementar app_details + espelho sites (mesma estratégia de port por method_name)**

- [ ] **Step 3: ITs sites smoke (`cat_list` ou `home`)**

```powershell
.\gradlew.bat test --tests com.libare.adm.reader.ApiSitesIT --tests com.libare.adm.reader.ApiPhpCatalogIT --no-daemon
```

- [ ] **Step 4: Commit**

```powershell
git commit -m "feat(reader): mirror app_details and api_sites.php"
```

---

### Task 8: Regressão completa + smoke cutover

**Files:** checklist no final deste plano (não precisa novo ficheiro)

- [ ] **Step 1: Suite reader + regressão backend relevante**

```powershell
cd C:\Users\User\Repository\adm-projeto\backend
. "C:\Users\User\Repository\Restruturacao ´Projeto PhP\scripts\local\dev.local.ps1"
$env:DB_PASSWORD = $script:DevDbPassword
.\gradlew.bat test --tests com.libare.adm.reader.* --tests com.libare.adm.users.CreateUserIT --no-daemon
```

Expected: PASS — em especial: user criado no admin (BCrypt) loga via `/user_login_api.php`.

- [ ] **Step 2: Smoke manual cURL (PowerShell)**

```powershell
Invoke-RestMethod "http://localhost:8080/api.php?method_name=home"
Invoke-RestMethod "http://localhost:8080/api.php?method_name=cat_list"
Invoke-RestMethod "http://localhost:8080/user_login_api.php?email=TESTE&password=TESTE&type=Normal&auth_id="
# capa:
# GET http://localhost:8080/legacy/assets/images/<ficheiro>
```

- [ ] **Step 3: Smoke Flutter**

1. Alterar base URL do app para `http://<host-lan>:8080/` (sem path PHP).
2. Abrir home, lista, detalhe livro, login Normal, favorito.
3. Se app Site em uso: apontar para `/api_sites.php`.

- [ ] **Step 4: Checklist cutover produção**

- [ ] Homolog Flutter OK só com Kotlin  
- [ ] DNS/proxy do host legado → Spring **ou** release do app com novo host  
- [ ] Desligar Apache/PHP ebook + APIs site  
- [ ] Manter `LEGACY_ASSETS_ROOT` (images/uploads) acessível  
- [ ] Jogos / `api_jogos.php` deliberadamente fora  

- [ ] **Step 5: Commit** (se houver ajustes de bugfix do smoke)

```powershell
git commit -m "test(reader): harden smoke coverage for php mirror cutover"
```

---

## Self-review (spec coverage)

| Requisito spec | Task |
|----------------|------|
| Rotas espelho + envelope | 1, 4 |
| Security permitAll leitor | 1 |
| Asset URLs `/legacy/assets` | 1, 5 |
| Upgrade-on-login + só hash em register | 2, 3 |
| Forgot sem senha em claro | 3 |
| method_name ebook mínimo | 5, 6, 7 |
| `api_sites.php` | 7 |
| Ondas 1–6 | Tasks 1→8 |
| ITs login / home / cat_list / flutter smoke | 2, 5, 8 |
| Jogos fora | fora do plano |
| Menus admin Perfil/Config/Notif/Site | spec separado (não neste plano) |

**Placeholders:** nenhum TBD — métodos catalog/social/sites pedem port linha-a-linha do PHP com tabelas e keys nomeadas.  
**Tipos:** `EbookAppEnvelope`, `ReaderPasswordService`, `LegacyAssetUrlBuilder`, `ReaderLang` estáveis em todas as tasks.

---

## Execução

**Plan complete and saved to `docs/superpowers/plans/2026-07-08-reader-api-php-mirror.md`.**

Duas opções de execução:

1. **Subagent-Driven (recomendado)** — um subagente por task, review entre tasks  
2. **Inline Execution** — executar nesta sessão com `executing-plans`, em lotes com checkpoints  

Qual abordagem?
