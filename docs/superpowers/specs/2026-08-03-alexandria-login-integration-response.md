# Integração de login: Alexandria × Painel ADM — resposta oficial

**Data:** 2026-08-03  
**Origem do pedido:** app Flutter `alexandria`  
**Destinatário deste doc:** time Alexandria + time painel `adm-libares-new`  
**Status:** Resposta alinhada — Opção A em andamento (**Tasks 1–6 concluídas**; falta `app_details` + cutover)

---

## Veredito

O diagnóstico do time Alexandria está **correto**: o login do app falha por **mismatch de contrato e de tipo de usuário**, não por validação de campo no Flutter.

| App aponta hoje | Backend no host admin | Resultado |
|-----------------|----------------------|-----------|
| `POST /api/v1/auth/login` (`username`) | `app_admin_users` (painel) | 401 para leitores |
| Esperado pelo produto | `tbl_users` via rotas PHP espelho | Ainda **não** no Kotlin |

---

## Respostas ao pedido

### 1. Estratégia oficial

**Opção A** permanece oficial: espelhar no Spring as rotas PHP do leitor (`/user_login_api.php`, `/api.php`, `/api_sites.php`, …) com envelope `EBOOK_APP`, conforme:

- Spec: `docs/superpowers/specs/2026-07-08-reader-api-php-mirror-design.md`
- Plano: `docs/superpowers/plans/2026-07-08-reader-api-php-mirror.md`
- Handoff: `docs/superpowers/plans/2026-07-09-reader-api-resume-handoff.md`

| Opção | Posição do painel |
|-------|-------------------|
| **A — Espelho PHP no Kotlin** | **Preferencial / oficial** |
| B — App volta ao PHP legado | Paliativo até A |
| C — Login admin no app | Só diagnóstico; **não** para produto |
| D — REST `/api/v1/reader/**` | Fase futura (Flutter reescreve contrato) |

### 2. Status da implementação (API leitor)

| Item | Situação (2026-08-03) |
|------|------------------------|
| Spec / plano | Prontos |
| `modules/reader/` | Tasks 1–6 ✅ — ebook `/api.php` quase completo; **falta** `app_details` |
| Login / catálogo / sites no Spring | Ainda em andamento (ondas 2–5 do plano) |
| Branch de trabalho | `feat/reader-api-php-mirror` (worktree `adm-wt-reader-api`) |

**Prazo fechado de produção:** não há data SLA documentada; cutover Flutter depende das 8 tasks do plano + smoke no app.

### 3. Enquanto A não estiver no ar

- Host `https://admin.alenxandriaglobaltec.com` = **painel Kotlin**. **Não** serve `user_login_api.php` / `api.php` para o leitor até o espelho estar deployado.
- **Opção B:** `EBOOK_SITE_BASE_URL` deve apontar para o **host PHP legado** (`adm-libares`) que ainda exponha `user_login_api.php` + `api.php`. Confirmar URL exacta com operação/VPS (não é o subdomínio `admin.*`).
- Não usar `POST /api/v1/auth/login` para leitores.

### 4. Senhas (`tbl_users`)

| Origem | Armazenamento | PHP legado (`==` plaintext) | Kotlin Opção A (upgrade-on-login) |
|--------|---------------|-----------------------------|-----------------------------------|
| Criado no painel (Usuários) | **BCrypt** | Falha (falso “credenciais inválidas”) | OK |
| Legado plaintext | Texto | OK | OK → regrava BCrypt |
| Argon2 legado | Hash | Depende do PHP | OK → upgrade BCrypt |

Fonte no código: comentário em `CreateUserUseCase` — painel **não** grava plaintext de propósito.

---

## Orientação prática ao Alexandria

1. Remover / não usar cliente admin (`/api/v1/auth/login`) para fluxo de leitor.
2. Curto prazo: restaurar cliente legado + base URL do PHP (Opção B), se o host legado ainda estiver ativo.
3. Médio prazo: após deploy da Opção A, apontar `EBOOK_SITE_BASE_URL` para o host Spring (pode ser o mesmo `admin.*` ou proxy) e chamar paths `.php` espelhados — **sem** JWT de painel.
4. Contas criadas só no painel novo: testar login preferencialmente no espelho Kotlin, não no PHP plaintext.

---

## Contacto técnico (painel)

- Repo: `adm-libares-new` / workspace restruturação PHP  
- Credenciais admin de teste (painel): ver README / seeds (`teste.admin`, etc.) — **não** são leitores do app.
