# Handoff — Retomar APIs do leitor (espelho PHP)

**Data da pausa:** 2026-07-08  
**Retomar em:** 2026-07-09  
**Status:** Spec ✅ | Plano ✅ | Implementação **Tasks 1–6 ✅** (2026-08-03) — Task 7 (app_details + sites) é a próxima

---

## Objetivo

Substituir as APIs PHP do app leitor (Flutter) por endpoints equivalentes no backend Kotlin, para o app só trocar o **host** e o Apache/PHP do ebook + Site poder ser desligado.

**Fora de escopo desta entrega:** Jogos (`api_jogos.php`), menus admin restantes (Perfil, Configurações, Notificações, CRUD Site no React).

---

## Documentos de referência

| Documento | Caminho |
|-----------|---------|
| Design (aprovado) | `docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md` |
| Plano de implementação (8 tasks) | `docs/superpowers/plans/2026-07-08-reader-api-php-mirror.md` |
| Este handoff | `docs/superpowers/plans/2026-07-09-reader-api-resume-handoff.md` |

**Fonte PHP canónica (portar linha a linha):**  
`C:\Users\User\Repository\adm-projeto\adm-libares\`  
→ `api.php`, `api_sites.php`, `user_*.php`, `language/app_language.php`

---

## Onde trabalhar amanhã

### Branch e worktree isolado (usar este)

| Item | Valor |
|------|--------|
| Worktree | `C:\Users\User\Repository\adm-wt-reader-api` |
| Branch | `feat/reader-api-php-mirror` |
| Base commit | `c4c0a5e` (catalog CRUD + create user já mergeado na história) |
| Código reader | Tasks 1–6: auth + catálogo + social/leitura em `/api.php` |

### NÃO misturar com

| Item | Motivo |
|------|--------|
| Repo principal `Restruturacao ´Projeto PhP` na branch `feat/catalog-crud-create-user` | Muito WIP unstaged (RBAC multi-tenant, Berry, etc.) |
| Junction `C:\Users\User\Repository\adm-projeto` | Aponta para o repo principal com WIP |

### Gradle / testes

```powershell
cd C:\Users\User\Repository\adm-wt-reader-api\backend
. "C:\Users\User\Repository\Restruturacao ´Projeto PhP\scripts\local\dev.local.ps1"
$env:DB_PASSWORD = $script:DevDbPassword
.\gradlew.bat test --no-daemon
```

**MySQL:** `adm_libare`, user `root`, senha `admin` (via `dev.local.ps1`)  
**Assets:** `LEGACY_ASSETS_ROOT` → pasta `adm-libares` (images/, uploads/)  
**Backend:** `http://localhost:8080` | **Admin FE:** `http://localhost:5173`

---

## Decisões já fechadas (não reabrir)

1. **Estratégia:** controllers espelho PHP — mesmas rotas e envelope `EBOOK_APP`
2. **Flutter:** só muda base URL
3. **Auth leitor:** upgrade-on-login (plaintext/Argon2 → BCrypt no sucesso)
4. **Register/update:** senha sempre hasheada (nunca plaintext)
5. **Forgot-password:** melhoria de segurança — **não** enviar senha em claro no e-mail (PHP atual envia; Kotlin não)
6. **Security:** rotas leitor `permitAll` (sem JWT admin)
7. **Assets nas respostas:** `{publicBase}/legacy/assets/images|uploads/...`
8. **Execução:** Subagent-Driven — 1 subagente por task + review spec + review qualidade

---

## Arquitetura alvo

```
Flutter
  → /api.php?method_name=...
  → /user_login_api.php, /user_register_api.php, ...
  → /api_sites.php?method_name=...
        ↓
modules/reader/
  ApiPhpController, ApiSitesController
  User*Controller
  EbookAppEnvelope, LegacyAssetUrlBuilder
  ReaderPasswordService
  Use cases + JdbcTemplate (queries legado)
        ↓
MySQL tbl_* / Sites / ...
/legacy/assets/**
```

**Envelope JSON:**
- Maioria dos endpoints: `{ "EBOOK_APP": [ {...} ] }`
- **Exceção `home`:** `{ "EBOOK_APP": { "featured_books":[], "latest_books":[], "popular_books":[] } }`

---

## Checklist de implementação (8 tasks)

Marcar conforme avançar. Detalhe completo (código, testes, commits) está no plano.

### Task 1 — Infra (Onda 1) — **CONCLUÍDA** (2026-08-03)

- [x] `ReaderPasswordService` + teste unitário (TDD)
- [x] `EbookAppEnvelope`, `LegacyAssetUrlBuilder`, `ReaderLang`
- [x] `SecurityConfig`: `permitAll` nas 8 rotas leitor
- [x] Commit: `feat(reader): envelope, asset URLs, password upgrade and public routes`

**Arquivos:**
- `backend/.../modules/reader/api/EbookAppEnvelope.kt`
- `backend/.../modules/reader/application/LegacyAssetUrlBuilder.kt`
- `backend/.../modules/reader/application/ReaderPasswordService.kt`
- `backend/.../modules/reader/application/ReaderLang.kt`
- `backend/.../shared/security/SecurityConfig.kt` (modify)
- `backend/src/test/.../reader/ReaderPasswordServiceTest.kt`

---

### Task 2 — Login (Onda 2) — **CONCLUÍDA** (2026-08-03)

- [x] `UserJpaRepository` finders (Normal + Google/Facebook)
- [x] `ReaderActiveLogService` (`tbl_active_log`)
- [x] `ReaderLoginUseCase` + `UserLoginController` em `/user_login_api.php`
- [x] IT: plaintext → upgrade BCrypt; BCrypt ok; senha errada
- [x] Commit: `feat(reader): mirror user_login_api with password upgrade`

### Task 3 — Register, perfil, forgot, galileu (Onda 2) — **CONCLUÍDA** (2026-08-03)

- [x] Controllers + use cases register / profile / forgot / galileu
- [x] `/user_register_api.php` — hash na criação Normal
- [x] `/user_register_galileu.php` — delega ao mesmo register
- [x] `/user_profile_api.php`, `/user_profile_update_api.php`
- [x] `/user_forgot_pass_api.php` — sem senha em claro no e-mail/JSON
- [x] IT: register + login; perfil; update; forgot
- [x] Commit: `feat(reader): mirror register, profile and forgot-password APIs`

### Task 4 — Dispatcher `/api.php` (shell) — **CONCLUÍDA** (2026-08-03)

- [x] `ApiPhpController` + `ApiPhpDispatcher`
- [x] Set `KNOWN` com todos os `method_name`
- [x] Fallback PHP: `msg` + `success: '1'` para method desconhecido
- [x] IT unknown method
- [x] Commit: `feat(reader): add api.php dispatcher shell`

### Task 5 — Catálogo ebook (Onda 3) — **CONCLUÍDA** (2026-08-03)

- [x] `ReaderAcervoFilter` (user_id → acervo_id; filtro `livros_acervos`)
- [x] Port SQL do PHP: home, cat_list, cat_id, author_*, latest, allbook, search_text, book_id, home_section*
- [x] URLs de imagem via `LegacyAssetUrlBuilder`
- [x] IT: `home` (objeto com 3 listas), `cat_list`
- [x] Commit: `feat(reader): mirror api.php catalog and home_section methods`

### Task 6 — Social + leitura (Onda 4) — **CONCLUÍDA** (2026-08-03)

- [x] Comments, ratings, favourite, wishlist
- [x] `book_page_state_*`, `continue_reading`, `con_reding_book` (typo mantido)
- [x] `removeuser`, `delete_userdata`
- [x] Tabelas: `tbl_comments`, `tbl_rating`, `tbl_favourite`, `tbl_wishlist`, `tbl_reading`, `tbl_book_page_notes`
- [x] IT toggle_favourite round-trip
- [x] Commit: `feat(reader): mirror comments ratings favourites wishlist and reading state`

### Task 7 — app_details + Site (Onda 5) — **PRÓXIMA**

- [ ] `app_details` → `tbl_settings` id=1 (campos AdMob, OneSignal, privacy, etc.)
- [ ] `/api_sites.php` — descobrir nomes exactos das tabelas Site no MySQL
- [ ] Port methods de `api_sites.php` (subset similar ao ebook, tabelas `Sites`, `Autores_site`, …)
- [ ] IT: `app_details` tem `app_name`; smoke `api_sites` home/cat_list
- [ ] Commit: `feat(reader): mirror app_details and api_sites.php`

**Antes de Task 7, rodar:**
```sql
SHOW TABLES FROM adm_libare LIKE '%site%';
SHOW TABLES FROM adm_libare LIKE 'Sites';
```

---

### Task 8 — Regressão + smoke cutover (Onda 6)

- [ ] `.\gradlew.bat test --tests com.libare.adm.reader.*`
- [ ] User criado no admin (BCrypt) loga via `/user_login_api.php`
- [ ] cURL smoke: home, cat_list, login
- [ ] Flutter: apontar base URL para Kotlin; validar ebook (+ Site se usado)
- [ ] Checklist produção: DNS/proxy → Kotlin; desligar PHP ebook/site; manter `LEGACY_ASSETS_ROOT`

---

## Critérios de aceite (spec)

- [ ] App ebook funciona só com host Kotlin
- [ ] Site (se usado) via `api_sites.php` no Kotlin
- [ ] Plaintext migra senha no 1º login OK
- [ ] User criado no admin (BCrypt) loga no app
- [ ] Assets em `/legacy/assets`
- [ ] Jogos não bloqueiam cutover

---

## Como retomar amanhã (passo a passo)

1. Abrir worktree: `cd C:\Users\User\Repository\adm-wt-reader-api`
2. Confirmar branch: `git branch --show-current` → `feat/reader-api-php-mirror`
3. Commitar docs no worktree (opcional, 1º commit do dia):
   ```powershell
   git add docs/superpowers/plans/2026-07-08-reader-api-php-mirror.md `
           docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md `
           docs/superpowers/plans/2026-07-09-reader-api-resume-handoff.md
   git commit -m "docs: reader API php mirror plan, spec and resume handoff"
   ```
4. Dizer ao agente: **"Retomar Subagent-Driven a partir da Task 1"**
5. Skill: `subagent-driven-development` — implementer → spec review → code review por task
6. Não usar junction `adm-projeto` para commits — só worktree

---

## Depois desta entrega (não é amanhã, mas na fila)

| Prioridade | Trabalho | Tipo |
|------------|----------|------|
| 1 | Menus admin: Perfil, Configurações, Notificações | Spec + plano separado |
| 2 | CRUD Site no React (grupo Site inteiro) | Spec + plano separado |
| 3 | Finalizar branch `feat/catalog-crud-create-user` (merge/PR) | Finishing branch |
| 4 | RBAC/Berry WIP no repo principal | Branch separada |

**Gaps conhecidos do catalog CRUD (não bloqueiam reader API):**
- Soft-delete de seção não limpa CSV em `tbl_books.section_ids`
- Muito WIP RBAC unstaged fora dos commits da feature catalog

---

## Estado dos serviços locais

Verificar se backend (`:8080`) e Vite (`:5173`) ainda estão rodando antes de smoke tests.  
Login admin de teste: `teste.admin` / `Admin@123`

---

## Resumo em uma frase

Amanhã: implementar no worktree `adm-wt-reader-api` / branch `feat/reader-api-php-mirror` as **8 tasks** do plano reader API, começando pela **Task 1** (infra + senha + security), com execução **Subagent-Driven** e port fiel do PHP em `adm-libares`.
