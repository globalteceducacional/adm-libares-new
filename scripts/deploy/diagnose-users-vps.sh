#!/usr/bin/env bash
# Diagnostica 500 em /api/v1/users
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
BASE="${1:-https://admin.alenxandriaglobaltec.com}"

echo "===== COLUNAS tbl_users ====="
docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 -e \
  "SHOW COLUMNS FROM adm_libare.tbl_users;"

echo
echo "===== COLUNAS tbl_comments ====="
docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 -e \
  "SHOW COLUMNS FROM adm_libare.tbl_comments;"

echo
echo "===== LOGIN + /users ====="
TOKEN="$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"teste.admin","password":"Admin@123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"
curl -s -w "\nHTTP %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-School-Context: 1" \
  "$BASE/api/v1/users" | cut -c1-400

echo
echo "===== ERRO BACKEND ====="
docker compose logs --since=90s --no-color backend 2>&1 \
  | grep -vE '\|[[:space:]]+at ' \
  | grep -vE '\|[[:space:]]+\.\.\. [0-9]+ (more|common frames omitted)' \
  | cut -c1-400 \
  | tail -40
