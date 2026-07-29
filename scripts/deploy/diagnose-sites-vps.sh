#!/usr/bin/env bash
# Reproduz o erro dos endpoints /api/v1/sites* e mostra a causa no log do backend.
# Uso (no host): bash scripts/deploy/diagnose-sites-vps.sh

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

BASE="http://127.0.0.1:5173"

echo "===== TABELAS DO MODULO SITE ====="
docker compose exec -T db mysql -uroot -proot -e \
  "SELECT table_name FROM information_schema.tables
    WHERE table_schema='adm_libare'
      AND (table_name LIKE '%site%' OR table_name='Sites');"

echo
echo "===== LOGIN ====="
TOKEN="$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"teste.admin","password":"Admin@123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"

if [ -z "$TOKEN" ]; then
  echo "!! login falhou"
  exit 1
fi
echo "token obtido"

echo
echo "===== CHAMANDO ENDPOINTS ====="
for ep in /api/v1/site-authors /api/v1/sites; do
  code="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$BASE$ep")"
  echo "$ep -> $code"
done

echo
echo "===== CAUSA NO LOG ====="
docker compose logs --tail=120 backend 2>&1 \
  | grep -E "SQLSyntaxError|doesn't exist|Unknown column|SQLException|JdbcSQLException|Caused by:|ERROR" \
  | cut -c1-220 \
  | tail -20

echo
echo "===== FIM ====="
