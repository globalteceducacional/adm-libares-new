# Deploy no servidor (`/opt`) — refatoração + PostgreSQL

**Servidor:** `srv1802676` (Ubuntu 24.04)  
**Repo:** https://github.com/globalteceducacional/adm-libares-new.git  
**Atualizado:** 2026-07-10

---

## Situação das branches (importante)

| Branch | O que tem | Banco no `docker-compose` |
|--------|-----------|---------------------------|
| `main` | Snapshot completo da refatoração (RBAC, multi-tenant, Berry, catalog CRUD, docs reader API) | **MySQL 8** + `APP_DATA_MODE=legacy` |
| `feat/postgres-migration` | Gancho PostgreSQL: driver, Flyway schema `core`, JPA remapeado, ETL MySQL→PG | **PostgreSQL 16** + `APP_DATA_MODE=core` |
| `feat/catalog-crud-create-user` | Mesmo tip de `main` (snapshot) | MySQL |

**Ainda não estão fundidos:** o código mais novo (`main`) e o gancho Postgres (`feat/postgres-migration`) divergem. Merge completo = tarefa separada (conflitos em entities, Flyway V1–V12 vs V1–V3 core).

No servidor, por enquanto, use **dois checkouts** ou alterne a branch conforme o objetivo.

---

## Pré-requisitos no servidor

```bash
# Docker + Compose plugin
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER   # depois: logout/login
docker --version
docker compose version
```

Portas usadas pelo compose: **5432** (PG) ou **3306** (MySQL), **8080** (API), **5173** (admin).

---

## 1) Clonar em `/opt`

```bash
cd /opt
sudo git clone https://github.com/globalteceducacional/adm-libares-new.git
sudo chown -R $USER:$USER /opt/adm-libares-new
cd /opt/adm-libares-new
```

---

## 2A) Subir **gancho PostgreSQL** (stack core)

Use quando quiser validar Postgres + schema `core` + admin básico daquela branch.

```bash
cd /opt/adm-libares-new
git fetch origin
git checkout feat/postgres-migration
git pull origin feat/postgres-migration

# Ajuste JWT e senhas antes de produção (edite docker-compose.yml)
docker compose up -d --build

# Health
curl -s http://127.0.0.1:8080/actuator/health
# Admin UI: http://<IP-DO-SERVIDOR>:5173
# API:     http://<IP-DO-SERVIDOR>:8080
```

**Credenciais padrão do compose (só lab):**
- Postgres: user `postgres` / senha `admin` / DB `adm_libare_core`
- JWT: valor demo no compose — **trocar em produção**

**ETL MySQL → Postgres** (se o MySQL legado estiver acessível a partir da máquina que roda o script):

- Script: `scripts/local/migrate-mysql-to-postgres.ps1` (hoje é PowerShell/Windows)
- No Linux: portar para `bash`+`psql`/`mysql` ou rodar o ETL de uma máquina Windows com acesso aos dois bancos
- Pré-requisito: Flyway V1–V3 já aplicados (sobe com o backend)

---

## 2B) Subir **refatoração atual** (`main`, MySQL)

Use quando quiser o painel com RBAC/multi-tenant/Berry como no snapshot.

```bash
cd /opt/adm-libares-new
git fetch origin
git checkout main
git pull origin main

docker compose down
docker compose up -d --build

curl -s http://127.0.0.1:8080/actuator/health
```

**Credenciais padrão do compose (só lab):**
- MySQL: root / `root` / DB `adm_libare`
- `APP_DATA_MODE=legacy`

**Assets PHP (capas/uploads):** monte ou copie a pasta `adm-libares` e defina:

```bash
# exemplo: volume no serviço backend
# LEGACY_ASSETS_ROOT=/opt/adm-libares
# LEGACY_PUBLIC_BASE_URL=https://seu-dominio-ou-ip:8080
```

---

## 3) Comandos úteis

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f db
docker compose down          # para tudo
docker compose down -v       # para e APAGA volumes (dados)
```

---

## 4) Produção (checklist mínimo)

- [ ] Trocar `JWT_SECRET`, senhas DB, não usar defaults do compose
- [ ] `VITE_API_BASE_URL` no build do frontend = URL pública da API (não `localhost` se o browser for externo)
- [ ] Firewall: liberar só 80/443 (nginx) em vez de 8080/5173 públicos, se possível
- [ ] Backup do volume `postgres_data` ou `mysql_data`
- [ ] Não commitar `.env` / `application-local.yml` / `dev.local.ps1`

---

## 5) Próximo passo de engenharia (local, não no servidor)

Unificar `main` + `feat/postgres-migration`:

1. Branch `feat/main-plus-postgres`
2. Trazer compose PG + driver + Flyway core **ou** evoluir Flyway multi-tenant para Postgres
3. Resolver entities (`tbl_*` legacy vs `catalog_*` core) e `APP_DATA_MODE`
4. Portar ETL para Linux (`migrate-mysql-to-postgres.sh`)
5. Só então um único `docker compose up` com a refatoração completa em Postgres

Até lá: no servidor, escolha **2A** (Postgres) ou **2B** (refatoração MySQL) conforme o teste do dia.
