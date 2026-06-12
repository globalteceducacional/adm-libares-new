# ADM Libare - Ambiente Local com Docker

Este repositório possui um ambiente local com:

- `db`: MySQL 8.4
- `backend`: Kotlin + Spring Boot (porta `8080`)
- `frontend`: React + Vite servido por Nginx (porta `5173`)

## Subir ambiente

```powershell
docker compose up -d --build
```

## Acessos

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## Credenciais iniciais

- Usuario: `admin`
- Senha: `password`

As credenciais iniciais sao inseridas por `Flyway` na migration `V1__baseline.sql`.

## Derrubar ambiente

```powershell
docker compose down
```

Para remover tambem o volume do banco:

```powershell
docker compose down -v
```

## Scripts locais (PowerShell)

### Bootstrap geral (frontend + validacoes)

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\bootstrap-dev.ps1"
```

Para iniciar tambem o frontend em modo dev:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\bootstrap-dev.ps1" -StartFrontend
```

### Preparar backend (gradle wrapper + test + health)

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\backend-ready.ps1"
```

Para subir o backend e validar health endpoint:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\backend-ready.ps1" -StartBackend
```

### Subir stack local (MySQL + backend + frontend)

Abre janelas separadas para Gradle e Vite; tenta Docker MySQL se a porta 3306 estiver livre:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\start-dev.ps1"
```

Apenas MySQL via Docker:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\start-db.ps1"
```

Credenciais MySQL locais (senha do seu instalador, nao a do Docker):

```powershell
Copy-Item scripts\local\dev.local.example.ps1 scripts\local\dev.local.ps1
# Edite DevDbPassword em dev.local.ps1
powershell -ExecutionPolicy Bypass -File "scripts\local\start-backend.ps1"
```

Documentacao da UI admin: `docs/frontend-admin-evolucao.md`

## Carga inicial de dados (dump SQL)

Para ambientes locais, o dump `u778451386_ebook.sql` e a fonte oficial de dados.

Exemplo com cliente MySQL:

```powershell
mysql -h localhost -P 3306 -u root -p adm_libare < "u778451386_ebook.sql"
```

## Migracao legado -> base estruturada (SQL)

Execute em ordem no DBeaver:

1. `scripts/migration/001_create_core_schema.sql`
2. `scripts/migration/002_migrate_from_legacy.sql`
3. `scripts/migration/003_validate_migration.sql`
4. `scripts/migration/004_rollback_core_data.sql` (somente se precisar desfazer a carga)
5. `scripts/migration/005_post_migration_indexes.sql` (otimizacao de performance, execute apos migracao)
6. `scripts/migration/006_smoke_test_core.sql` (sanity check funcional da base nova)
7. `scripts/migration/007_create_legacy_compat_views.sql` (compatibilidade para backend atual)
8. `scripts/migration/008_add_audit_triggers.sql` (triggers de auditoria em `UPDATE` e bloqueio de `DELETE` físico)
9. `scripts/migration/009_soft_delete_helpers.sql` (stored procedures padronizadas de exclusão lógica)
10. `scripts/migration/010_restore_helpers.sql` (stored procedures de restauração após soft delete)
11. `scripts/migration/011_audit_reports.sql` (consultas de relatório de auditoria; executar quando precisar analisar dados)
12. `scripts/migration/012_audit_views.sql` (views reutilizáveis para auditoria)
13. `scripts/migration/013_seed_permissions_audit.sql` (role MySQL `role_audit_readonly` e `GRANT` nas views — opcional)

**Ordem importante:** execute `012` antes de `013` (as permissões referem-se às views). Os scripts `011` são independentes e podem ser corridos em qualquer momento após a base `adm_libare_core` estar criada e populada.

Base de origem: `adm_libare`  
Base de destino: `adm_libare_core`

### Auditoria e variável de sessão MySQL (modo `core`)

Os triggers em `008_add_audit_triggers.sql` utilizam a variável de sessão `@app_user_id` para preencher `updated_by` quando o utilizador autenticado está definido.

No backend (Kotlin + Spring Boot 3.3, pool JDBC/Hibernate), os casos de uso que alteram dados chamam `AuditSessionContext.applyActor(...)` antes da escrita. Isso executa `SET @app_user_id = ?` na mesma ligação JDBC da transação, com o identificador do administrador autenticado (JWT) resolvido por `CurrentActorResolver`. Se não houver sessão, a variável não é definida e os triggers mantêm os valores já presentes na linha (`NULL`, etc.).

## Alternar backend entre legado e core (feature flag)

- Modo legado (padrao):
  - `APP_DATA_MODE=legacy`
  - `DB_URL` apontando para `adm_libare`
- Modo core:
  - execute `007_create_legacy_compat_views.sql` em `adm_libare_core`
  - `APP_DATA_MODE=core`
  - `DB_URL` apontando para `adm_libare_core`
