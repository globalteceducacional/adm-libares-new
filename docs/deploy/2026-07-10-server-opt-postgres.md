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

## 4) Produção — domínio admin (`admin.alenxandriaglobaltec.com`)

Painel React + proxy `/api` no container frontend (`frontend-admin/nginx.conf`).

### DNS

Apontar `admin.alenxandriaglobaltec.com` (A/CNAME) para o IP do servidor.

### TLS + reverse proxy (host)

Exemplo nginx no host (443 → container frontend na 5173):

```nginx
server {
    listen 443 ssl http2;
    server_name admin.alenxandriaglobaltec.com;

    # ssl_certificate     /etc/letsencrypt/live/admin.alenxandriaglobaltec.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/admin.alenxandriaglobaltec.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Certbot: `sudo certbot --nginx -d admin.alenxandriaglobaltec.com`

### Compose (produção)

```bash
cd /opt/adm-libares-new
git fetch origin && git checkout feat/site-module   # ou main apos merge
git pull

export LEGACY_PUBLIC_BASE_URL=https://admin.alenxandriaglobaltec.com
export CORS_ALLOWED_ORIGIN_PATTERNS='https://admin.alenxandriaglobaltec.com,https://*.alenxandriaglobaltec.com,http://localhost:*'
# opcional: pasta PHP com images/
# export LEGACY_ASSETS_ROOT=/opt/adm-libares

docker compose up -d --build
curl -sI https://admin.alenxandriaglobaltec.com
curl -s https://admin.alenxandriaglobaltec.com/api/v1/auth/login -o /dev/null -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -d '{}'
```

No build do frontend, `VITE_API_BASE_URL` vazio (default do compose) = chamadas relative `/api/...` via nginx do container.

### Imagens / assets legados (obrigatório no VPS)

Sem a pasta `images/` montada, capas retornam 401/404 em `/legacy/assets/**`.

```bash
cd /opt/adm-libares-new
mkdir -p legacy-assets/images/thumbs legacy-assets/uploads

# Copie do servidor PHP (adm-libares) — ajuste a origem:
# rsync -avz user@php-host:/var/www/adm-libares/images/ ./legacy-assets/images/
# rsync -avz user@php-host:/var/www/adm-libares/uploads/ ./legacy-assets/uploads/

export LEGACY_ASSETS_HOST_PATH=./legacy-assets
export LEGACY_ASSETS_ROOT=/legacy-assets
export LEGACY_PUBLIC_BASE_URL=http://187.127.47.204:5173   # ou https://admin.alenxandriaglobaltec.com

docker compose up -d --build
curl -I "http://127.0.0.1:8080/legacy/assets/images/alguma-capa.jpg"
```

O `docker-compose.yml` monta `${LEGACY_ASSETS_HOST_PATH:-./legacy-assets}` → `/legacy-assets` no backend.

### Checklist mínimo

- [ ] DNS `admin.alenxandriaglobaltec.com` → servidor
- [ ] TLS (Let's Encrypt)
- [ ] Pasta `legacy-assets/images` (e `uploads`) montada; `LEGACY_ASSETS_ROOT` definido
- [ ] Trocar `JWT_SECRET`, senhas DB, não usar defaults do compose
- [ ] CORS inclui origem do painel (IP `:5173` ou domínio HTTPS)
- [ ] Firewall: liberar só 80/443 (nginx host) em vez de 8080/5173 públicos, se possível
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
