# Swagger / OpenAPI (admin + leitor) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor Swagger UI e OpenAPI 3 no backend com tags Admin (controllers `/api/v1/**`) + Leitor (contrato PHP estático), ambos acessíveis só com JWT admin.

**Architecture:** SpringDoc (`springdoc-openapi-starter-webmvc-ui` 2.6.0) gera o grupo Admin a partir dos controllers. O grupo Leitor é um OpenAPI YAML em classpath servido em `/v3/api-docs/leitor`. Um bean `OpenAPI` define Bearer JWT. Swagger UI lista os dois grupos. `SecurityConfig` já exige autenticação em qualquer request não listado em `permitAll` — swagger e api-docs ficam protegidos sem `permitAll` extra. ITs MockMvc cobrem 401 sem token / 200 com token.

**Tech Stack:** Kotlin / Spring Boot 3.3.4 / Spring Security / springdoc-openapi 2.6.0 / Jackson YAML / MockMvc ITs

**Spec:** `docs/superpowers/specs/2026-07-14-swagger-openapi-design.md`

**Convenção de commit (PowerShell):** `git commit -m "mensagem"` (sem heredoc bash).

**Browser + JWT:** a UI em si exige `Authorization: Bearer`. Em IT usa-se header MockMvc. No browser: extensão tipo ModHeader / Requestly com o token do `POST /api/v1/auth/login`, ou chamada direta a `/v3/api-docs/**` com header.

---

## Mapa de arquivos

| Área | Criar | Modificar |
|------|-------|-----------|
| Dep | — | `backend/build.gradle.kts` |
| Config | `backend/.../shared/openapi/OpenApiConfig.kt` | `backend/src/main/resources/application.yml` |
| Leitor spec | `backend/src/main/resources/openapi/reader-php-mirror.yaml` | — |
| Serve YAML | `backend/.../shared/openapi/ReaderOpenApiController.kt` | — |
| Admin annotations | — | Todos `*Controller.kt` em `modules/*/api/` |
| Security | — | Só se algum `permitAll` indevido surgir — **não** liberar swagger |
| Tests | `backend/src/test/kotlin/com/libare/adm/openapi/SwaggerSecurityIT.kt` | — |
| Deploy note | — | `docs/deploy/2026-07-10-server-opt-postgres.md` (proxy nginx) |
| Spec status | — | `docs/superpowers/specs/2026-07-14-swagger-openapi-design.md` |

---

### Task 1: Dependência springdoc + IT de segurança (falha primeiro)

**Files:**
- Modify: `backend/build.gradle.kts`
- Create: `backend/src/test/kotlin/com/libare/adm/openapi/SwaggerSecurityIT.kt`
- Create: `backend/src/main/kotlin/com/libare/adm/shared/openapi/OpenApiConfig.kt` (mínimo na Task 2; nesta task só o necessário para o teste ver `/v3/api-docs`)

- [ ] **Step 1: Escrever IT (espera 401 sem token; 200 com token após springdoc)**

```kotlin
package com.libare.adm.openapi

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class SwaggerSecurityIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `api-docs sem token retorna 401`() {
        mockMvc.get("/v3/api-docs")
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `swagger-ui sem token retorna 401`() {
        mockMvc.get("/swagger-ui/index.html")
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `api-docs com JWT admin retorna 200`() {
        val token = loginToken()
        mockMvc.get("/v3/api-docs") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith(MediaType.APPLICATION_JSON) }
        }
    }

    private fun loginToken(): String {
        val loginJson = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"teste.admin","password":"Admin@123"}"""
        }.andReturn().response.contentAsString
        val token = Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
        require(!token.isNullOrBlank()) { "login falhou: $loginJson" }
        return token
    }
}
```

- [ ] **Step 2: Rodar IT — espera falha (404/401 inconsistente ou 404 sem springdoc)**

```powershell
cd "C:\Users\User\Repository\Restruturacao ´Projeto PhP\backend"
.\gradlew.bat test --tests com.libare.adm.openapi.SwaggerSecurityIT --no-daemon
```

Expected: FAIL (ex.: 404 em `/v3/api-docs` sem springdoc, ou login se DB indisponível)

- [ ] **Step 3: Adicionar dependências**

Em `backend/build.gradle.kts`, dentro de `dependencies { }`:

```kotlin
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-yaml")
```

- [ ] **Step 4: Garantir que SecurityConfig NÃO libera swagger**

Em `SecurityConfig.kt`, confirmar que **não** existe:

```kotlin
it.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
```

Manter `anyRequest().authenticated()`. Login continua público:

```kotlin
it.requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
```

- [ ] **Step 5: Rodar IT até verde (após Task 2 se ainda faltar bean — preferir Task 1+2 no mesmo ciclo se necessário)**

```powershell
.\gradlew.bat test --tests com.libare.adm.openapi.SwaggerSecurityIT --no-daemon
```

Expected: PASS (3 testes)

- [ ] **Step 6: Commit**

```powershell
git add backend/build.gradle.kts backend/src/test/kotlin/com/libare/adm/openapi/SwaggerSecurityIT.kt
git commit -m "test: protect swagger and api-docs behind admin JWT"
```

---

### Task 2: OpenApiConfig + application.yml (Bearer + dois grupos na UI)

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/shared/openapi/OpenApiConfig.kt`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: Criar `OpenApiConfig.kt`**

```kotlin
package com.libare.adm.shared.openapi

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun openAPI(): OpenAPI =
        OpenAPI()
            .info(
                Info()
                    .title("ADM Libare API")
                    .version("1.0")
                    .description(
                        """
                        Documentação Admin (`/api/v1/**`) + contrato Leitor (espelho PHP).
                        Authorize com JWT obtido em `POST /api/v1/auth/login`.
                        Rotas Leitor podem retornar 404 até o cutover Kotlin — o contrato é canónico para Flutter.
                        """.trimIndent()
                    )
            )
            .components(
                Components().addSecuritySchemes(
                    "bearer-jwt",
                    SecurityScheme()
                        .name("bearer-jwt")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                )
            )
            .addSecurityItem(SecurityRequirement().addList("bearer-jwt"))

    @Bean
    fun adminApi(): GroupedOpenApi =
        GroupedOpenApi.builder()
            .group("admin")
            .displayName("Admin")
            .pathsToMatch("/api/v1/**")
            .build()
}
```

- [ ] **Step 2: Acrescentar springdoc em `application.yml`**

```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
    tagsSorter: alpha
    urls:
      - name: Admin
        url: /v3/api-docs/admin
      - name: Leitor
        url: /v3/api-docs/leitor
```

- [ ] **Step 3: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/shared/openapi/OpenApiConfig.kt backend/src/main/resources/application.yml
git commit -m "feat: add SpringDoc OpenAPI config with bearer JWT"
```

---

### Task 3: Servir contrato leitor em `/v3/api-docs/leitor`

**Files:**
- Create: `backend/src/main/kotlin/com/libare/adm/shared/openapi/ReaderOpenApiController.kt`
- Create: `backend/src/main/resources/openapi/reader-php-mirror.yaml` (esqueleto na Task 3; completar na Task 4)
- Modify: `SwaggerSecurityIT.kt` (assert extra)

- [ ] **Step 1: Esqueleto YAML mínimo**

Criar `backend/src/main/resources/openapi/reader-php-mirror.yaml`:

```yaml
openapi: 3.0.3
info:
  title: Libare Leitor — contrato espelho PHP
  version: "1.0"
  description: |
    Contrato canónico para o Flutter. Implementação Kotlin pode ainda não existir (404 em Try-it-out).
    Envelope: a maioria responde `EBOOK_APP` como **array**; `method_name=home` responde **objeto**.
    Spec relacionada: docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md
servers:
  - url: /
tags:
  - name: Leitor - Auth
  - name: Leitor - Catalog
  - name: Leitor - Social
  - name: Leitor - Reading
  - name: Leitor - App
  - name: Leitor - Sites
paths:
  /api.php:
    get:
      tags: [Leitor - Catalog]
      operationId: apiPhpGet
      summary: Dispatcher ebook (GET)
      description: |
        Query obrigatória `method_name`. Valores e payloads — Task 4 preenche enum completo.
        **Status runtime:** implementação Kotlin pendente.
      parameters:
        - name: method_name
          in: query
          required: true
          schema:
            type: string
            enum: [home]
      responses:
        "200":
          description: Envelope EBOOK_APP
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/EbookAppEnvelope"
              examples:
                home:
                  value:
                    EBOOK_APP:
                      featured_books: []
                      latest_books: []
                      popular_books: []
components:
  schemas:
    EbookAppEnvelope:
      type: object
      required: [EBOOK_APP]
      properties:
        EBOOK_APP:
          description: Array na maioria dos methods; objeto no method home
          oneOf:
            - type: array
              items:
                type: object
            - type: object
              additionalProperties: true
    EbookAppSuccessItem:
      type: object
      properties:
        success:
          type: string
          example: "1"
        MSG:
          type: string
```

- [ ] **Step 2: Controller que lê YAML e devolve JSON**

```kotlin
package com.libare.adm.shared.openapi

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import org.springframework.core.io.ClassPathResource
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ReaderOpenApiController {
    private val yamlMapper = ObjectMapper(YAMLFactory())
    private val jsonMapper = ObjectMapper()

    @GetMapping(value = ["/v3/api-docs/leitor"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun readerOpenApi(): String {
        val resource = ClassPathResource("openapi/reader-php-mirror.yaml")
        require(resource.exists()) { "openapi/reader-php-mirror.yaml ausente" }
        val tree = resource.inputStream.use { yamlMapper.readTree(it) }
        return jsonMapper.writeValueAsString(tree)
    }
}
```

- [ ] **Step 3: Estender IT**

Adicionar em `SwaggerSecurityIT`:

```kotlin
    @Test
    fun `leitor api-docs com JWT retorna EBOOK_APP no contrato`() {
        val token = loginToken()
        mockMvc.get("/v3/api-docs/leitor") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            content { string(org.hamcrest.Matchers.containsString("EBOOK_APP")) }
            content { string(org.hamcrest.Matchers.containsString("Leitor - Catalog")) }
        }
    }

    @Test
    fun `leitor api-docs sem token retorna 401`() {
        mockMvc.get("/v3/api-docs/leitor")
            .andExpect { status { isUnauthorized() } }
    }
```

- [ ] **Step 4: Rodar testes**

```powershell
.\gradlew.bat test --tests com.libare.adm.openapi.SwaggerSecurityIT --no-daemon
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/shared/openapi/ReaderOpenApiController.kt backend/src/main/resources/openapi/reader-php-mirror.yaml backend/src/test/kotlin/com/libare/adm/openapi/SwaggerSecurityIT.kt
git commit -m "feat: serve reader OpenAPI contract at /v3/api-docs/leitor"
```

---

### Task 4: Completar `reader-php-mirror.yaml` (contrato Flutter)

**Files:**
- Modify: `backend/src/main/resources/openapi/reader-php-mirror.yaml`

- [ ] **Step 1: Expandir `/api.php`**

No mesmo path, documentar GET e POST com o mesmo parâmetro `method_name` e enum **completo**:

```
home, latest, allbook, search_text, cat_list, cat_id, author_list, author_id, book_id,
home_section, home_section_id, add_comment, get_all_comments, removecomment,
submit_rating, rating_check, toggle_favourite, favourite_list, toggle_wishlist,
wishlist_list, book_page_state_list, book_page_state_save, continue_reading,
con_reding_book, removeuser, delete_userdata, app_details
```

Incluir na `description` (markdown) uma tabela method → tag sugerida → params extras típicos (`book_id`, `user_id`, `cat_id`, `search_text`, `page`, etc.) alinhada ao PHP / spec `2026-07-08-reader-api-php-mirror-design.md`.

Examples nomeados no response:
- `home` → objeto `EBOOK_APP`
- `cat_list` → `{ "EBOOK_APP": [ { "cid": "1", "category_name": "..." } ] }`
- `success_msg` → `{ "EBOOK_APP": [ { "success": "1", "MSG": "..." } ] }`

Tags no operation: pode listar várias (`Leitor - Catalog`, etc.) ou uma só Catalog + texto; preferir **Catalog** no `/api.php` e Auth/Sites nos paths `.php` dedicados.

- [ ] **Step 2: Paths `user_*.php` e Sites**

Adicionar paths (GET e/ou POST conforme Flutter/PHP):

| Path | Tag | Params / body principais |
|------|-----|---------------------------|
| `/user_login_api.php` | Leitor - Auth | `email`, `password`, variantes Google/Facebook |
| `/user_register_api.php` | Leitor - Auth | campos registro |
| `/user_register_galileu.php` | Leitor - Auth | stub/variante |
| `/user_forgot_pass_api.php` | Leitor - Auth | email; **sem** senha em claro no e-mail (nota) |
| `/user_profile_api.php` | Leitor - Auth | user id / token legado conforme PHP |
| `/user_profile_update_api.php` | Leitor - Auth | perfil + imagem |
| `/api_sites.php` | Leitor - Sites | dispatcher/query alinhada ao PHP |

Cada um com response `EbookAppEnvelope` + example mínimo + nota “Kotlin pendente”.

Não incluir `api_jogos.php`.

- [ ] **Step 3: Validar YAML carrega**

```powershell
.\gradlew.bat test --tests com.libare.adm.openapi.SwaggerSecurityIT --no-daemon
```

Expected: PASS; corpo de `/v3/api-docs/leitor` contém `user_login_api.php` e `api_sites.php`.

Estender IT:

```kotlin
            content { string(org.hamcrest.Matchers.containsString("user_login_api.php")) }
            content { string(org.hamcrest.Matchers.containsString("api_sites.php")) }
            content { string(org.hamcrest.Matchers.containsString("allbook")) }
```

- [ ] **Step 4: Commit**

```powershell
git add backend/src/main/resources/openapi/reader-php-mirror.yaml backend/src/test/kotlin/com/libare/adm/openapi/SwaggerSecurityIT.kt
git commit -m "docs: complete reader PHP-mirror OpenAPI contract"
```

---

### Task 5: Anotar controllers Admin (Auth + Books)

**Files:**
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/auth/api/AuthController.kt`
- Modify: `backend/src/main/kotlin/com/libare/adm/modules/catalog/api/BookController.kt`

- [ ] **Step 1: `AuthController`**

```kotlin
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag

@Tag(name = "Admin - Auth")
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val loginUseCase: LoginUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase
) {

    @Operation(
        summary = "Login admin",
        description = "Público. Retorna accessToken JWT para Authorize no Swagger.",
        security = [] // override do security global — login sem Bearer
    )
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val response = loginUseCase.execute(request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Usuário autenticado + permissões")
    @SecurityRequirement(name = "bearer-jwt")
    @GetMapping("/me")
    fun me(): ResponseEntity<AuthMeResponse> {
        val response = getCurrentUserUseCase.execute()
        return ResponseEntity.ok(response)
    }
}
```

Nota: se `security = []` na annotation não limpar o global do bean OpenAPI, documentar no description que login é público; o runtime já é `permitAll`.

- [ ] **Step 2: `BookController`**

```kotlin
@Tag(name = "Admin - Books")
@RestController
@RequestMapping("/api/v1/books")
class BookController(/* ... */) {
    @Operation(summary = "Listar livros")
    @GetMapping
    fun list(/* ... */) { /* existing */ }

    @Operation(summary = "Criar livro")
    @PostMapping
    fun create(/* ... */) { /* existing */ }

    // Demais métodos: summary em português curto (update, delete, upload capa/arquivo, options)
}
```

Aplicar `@Operation(summary = "...")` em **todos** os endpoints do controller (list, options, create, update, delete, uploads).

- [ ] **Step 3: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/auth/api/AuthController.kt backend/src/main/kotlin/com/libare/adm/modules/catalog/api/BookController.kt
git commit -m "docs: annotate Auth and Books controllers for OpenAPI"
```

---

### Task 6: Anotar restantes controllers Admin

**Files (cada um com `@Tag` + `@Operation` por método):**

| Arquivo | Tag |
|---------|-----|
| `modules/catalog/api/AuthorController.kt` | `Admin - Books` ou `Admin - Authors` — usar **`Admin - Authors`** |
| `modules/catalog/api/CategoryController.kt` | `Admin - Categories` |
| `modules/catalog/api/HomeSectionController.kt` | `Admin - Home Sections` |
| `modules/catalog/api/AcervoController.kt` | `Admin - Acervos` |
| `modules/users/api/UserController.kt` | `Admin - Users` |
| `modules/comments/api/CommentController.kt` | `Admin - Comments` |
| `modules/dashboard/api/DashboardController.kt` | `Admin - Dashboard` |
| `modules/audit/api/AuditController.kt` | `Admin - Audit` |
| `modules/rbac/api/RoleController.kt` | `Admin - Roles` |
| `modules/rbac/api/AdminUserController.kt` | `Admin - Admin Users` |
| `modules/schools/api/SchoolController.kt` | `Admin - Schools` |

- [ ] **Step 1: Para cada arquivo**, adicionar imports springdoc, `@Tag` na classe e `@Operation(summary = "...")` em cada mapping. Não alterar lógica.

Exemplo mínimo para um controller:

```kotlin
@Tag(name = "Admin - Users")
@RestController
@RequestMapping("/api/v1/users")
class UserController(/* ... */) {
    @Operation(summary = "Listar usuários")
    @GetMapping
    fun list(/* ... */) { /* unchanged body */ }
}
```

- [ ] **Step 2: Verificar grupo admin no IT (opcional assert)**

```kotlin
    @Test
    fun `admin group docs contém auth login`() {
        val token = loginToken()
        mockMvc.get("/v3/api-docs/admin") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            content { string(org.hamcrest.Matchers.containsString("/api/v1/auth/login")) }
            content { string(org.hamcrest.Matchers.containsString("Admin - Auth")) }
        }
    }
```

- [ ] **Step 3: Rodar IT**

```powershell
.\gradlew.bat test --tests com.libare.adm.openapi.SwaggerSecurityIT --no-daemon
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add backend/src/main/kotlin/com/libare/adm/modules/**/api/*Controller.kt backend/src/test/kotlin/com/libare/adm/openapi/SwaggerSecurityIT.kt
git commit -m "docs: annotate remaining admin controllers for OpenAPI"
```

---

### Task 7: Deploy note (proxy nginx) + atualizar status da spec

**Files:**
- Modify: `docs/deploy/2026-07-10-server-opt-postgres.md`
- Modify: `docs/superpowers/specs/2026-07-14-swagger-openapi-design.md`

- [ ] **Step 1: Acrescentar secção no deploy doc**

```markdown
## Swagger / OpenAPI

UI: `http://<host>:8080/swagger-ui.html` (exige `Authorization: Bearer <JWT admin>`).

Specs:
- Admin: `/v3/api-docs/admin`
- Leitor: `/v3/api-docs/leitor`

Se o frontend nginx fizer proxy de `/api`, **recomendado** também:

```nginx
location /swagger-ui/ { proxy_pass http://backend:8080/swagger-ui/; }
location /v3/api-docs { proxy_pass http://backend:8080/v3/api-docs; }
```

Obter JWT: `POST /api/v1/auth/login` com admin (`teste.admin` / senha do ambiente). No browser, usar extensão de header ou ferramenta HTTP com Bearer.
```

- [ ] **Step 2: Spec status**

Trocar cabeçalho da spec para:

```markdown
**Status:** Aprovado — plano em `docs/superpowers/plans/2026-07-14-swagger-openapi.md`
```

- [ ] **Step 3: Commit**

```powershell
git add docs/deploy/2026-07-10-server-opt-postgres.md docs/superpowers/specs/2026-07-14-swagger-openapi-design.md
git commit -m "docs: link swagger plan and nginx proxy notes"
```

---

### Task 8: Aceite manual (checklist)

- [ ] **Step 1: Subir backend local** (perfil/DB habituais do projeto)

- [ ] **Step 2: Login**

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/v1/auth/login -ContentType "application/json" -Body '{"username":"teste.admin","password":"Admin@123"}'
```

- [ ] **Step 3: Com o `accessToken`, GET docs**

```powershell
$h = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:8080/v3/api-docs/admin -Headers $h
Invoke-RestMethod -Uri http://localhost:8080/v3/api-docs/leitor -Headers $h
```

Expected: JSON com paths admin e leitor.

- [ ] **Step 4: Sem header** → 401 em `/swagger-ui/index.html` e `/v3/api-docs`
- [ ] **Step 5: Checklist spec**
- [ ] JWT válido abre documentação Admin + Leitor  
- [ ] Sem JWT → 401  
- [ ] Login documentado / Try-it-out login funciona com UI autenticada  
- [ ] Leitor com params + exemplo `EBOOK_APP`  
- [ ] Admin com tags/`@Operation`  
- [ ] Sem secrets nos exemplos  

---

## Self-review do plano (vs spec)

| Requisito spec | Task |
|----------------|------|
| SpringDoc OpenAPI 3 | 1–2 |
| JWT só em swagger + api-docs | 1 (IT + sem permitAll) |
| Tags Admin / Leitor | 2–6 |
| YAML contrato leitor completo | 3–4 |
| Anotações controllers | 5–6 |
| Deploy / nginx | 7 |
| Critérios aceite | 1 ITs + 8 |
| Fora de escopo (controllers leitor, jogos, SDK Flutter) | não incluídos |

Sem placeholders TBD; versão springdoc **2.6.0** explícita (Boot 3.3.x).