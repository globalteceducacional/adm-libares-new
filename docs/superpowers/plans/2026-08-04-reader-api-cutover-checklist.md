# Cutover checklist — API leitor Kotlin (Opção A)

**Data:** 2026-08-04  
**Branch:** `feat/reader-api-php-mirror`  
**Worktree:** `C:\Users\User\Repository\adm-wt-reader-api`

## Verificado automaticamente (Task 8)

- [x] `.\gradlew.bat test --tests com.libare.adm.reader.*` — PASS
- [x] `CreateUserIT` — PASS
- [x] Rotas espelho: `/user_*.php`, `/api.php`, `/api_sites.php` (permitAll)

## Smoke local (quando backend `:8080` estiver up)

```powershell
Invoke-RestMethod "http://localhost:8080/api.php?method_name=home"
Invoke-RestMethod "http://localhost:8080/api.php?method_name=cat_list"
Invoke-RestMethod "http://localhost:8080/api.php?method_name=app_details"
Invoke-RestMethod "http://localhost:8080/user_login_api.php?email=EMAIL&password=SENHA&type=Normal&auth_id="
Invoke-RestMethod "http://localhost:8080/api_sites.php?method_name=home"
```

## Flutter (Alexandria)

1. `EBOOK_SITE_BASE_URL` → host Kotlin (ex.: `https://admin.alenxandriaglobaltec.com/` **após** deploy desta branch)
2. Cliente deve chamar paths legados (`user_login_api.php`, `api.php`), **não** `/api/v1/auth/login`
3. Validar: login Normal, home, detalhe livro, favorito; Site via `api_sites.php` se usado

## Produção

- [ ] Merge/PR da branch + deploy VPS (`deploy-vps.sh`)
- [ ] Flyway V20–V22 aplicados (`tbl_active_log`, social, `tbl_settings`)
- [ ] `LEGACY_PUBLIC_BASE_URL` + `LEGACY_ASSETS_ROOT` (images/uploads)
- [ ] Homolog Flutter OK só com Kotlin
- [ ] DNS/proxy legado → Spring **ou** release do app com novo host
- [ ] Desligar Apache/PHP ebook + APIs site
- [ ] Jogos / `api_jogos.php` deliberadamente fora

## Senhas

| Origem | Comportamento no Kotlin |
|--------|-------------------------|
| Plaintext legado | Login OK → upgrade BCrypt |
| BCrypt (painel) | Login OK |
| PHP legado plaintext | BCrypt do painel **não** autentica no PHP antigo |
