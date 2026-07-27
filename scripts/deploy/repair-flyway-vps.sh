#!/usr/bin/env bash
# Repara Flyway (success=0) e reconstrói o backend no VPS.
# Uso (no host): bash scripts/deploy/repair-flyway-vps.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> Repo: $ROOT"
git fetch origin
git checkout main
git reset --hard origin/main
echo "==> Commit: $(git log -1 --oneline)"

echo "==> Removendo migrations falhas (success=0)..."
docker compose exec -T db mysql -uroot -proot -e \
  "DELETE FROM adm_libare.flyway_schema_history WHERE success = 0;
   SELECT version, description, success FROM adm_libare.flyway_schema_history ORDER BY installed_rank;"

echo "==> Tabelas no schema (precisa do dump PHP para livros/capas)..."
docker compose exec -T db mysql -uroot -proot -e \
  "SHOW TABLES FROM adm_libare;"

echo "==> Rebuild backend (sem cache)..."
docker compose build --no-cache backend
docker compose up -d --force-recreate backend

echo "==> Aguardando boot..."
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:5173/actuator/health | grep -q '"status":"UP"'; then
    echo "==> OK: backend UP"
    curl -s http://127.0.0.1:5173/actuator/health
    echo
    docker compose ps backend
    exit 0
  fi
  sleep 2
done

echo "==> Ainda sem UP. Últimos logs:"
docker compose logs --tail=40 backend
exit 1
