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

echo "==> Migrations falhas ANTES do reparo (evidencia da causa):"
docker compose exec -T db mysql -uroot -proot -e \
  "SELECT version, description FROM adm_libare.flyway_schema_history WHERE success = 0;"

echo "==> Erro de migration registrado no log:"
docker compose logs --no-color backend 2>&1 \
  | grep -E "Migration V[0-9]+|SQL State|Error Code|Message   " \
  | tail -15

echo "==> Removendo migrations falhas (success=0)..."
docker compose exec -T db mysql -uroot -proot -e \
  "DELETE FROM adm_libare.flyway_schema_history WHERE success = 0;
   SELECT version, description, success FROM adm_libare.flyway_schema_history ORDER BY installed_rank;"

echo "==> Tabelas no schema..."
docker compose exec -T db mysql -uroot -proot -N -e \
  "SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema='adm_libare';
   SELECT table_name FROM information_schema.tables WHERE table_schema='adm_libare' AND table_name IN ('tbl_books','app_admin_users','Sites') ORDER BY table_name;"

echo "==> Rebuild backend (sem cache)..."
docker compose build --no-cache backend
docker compose up -d --force-recreate backend

echo "==> Aguardando boot (ate 90s)..."
for i in $(seq 1 45); do
  if curl -sf http://127.0.0.1:5173/actuator/health | grep -q '"status":"UP"'; then
    echo "==> OK: backend UP"
    curl -s http://127.0.0.1:5173/actuator/health
    echo
    docker compose ps backend
    exit 0
  fi
  sleep 2
done

echo "==> Ainda sem UP. Erro resumido:"
docker compose logs --tail=80 backend | grep -E "Caused by:|failed migration|Schema-validation|ERROR|Exception:" | tail -30
docker compose logs --tail=40 backend
exit 1
