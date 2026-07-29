#!/usr/bin/env bash
# Reproduz o 500 do dashboard e mostra a causa no log (sem frames da pilha).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
BASE="http://127.0.0.1:5173"

TOKEN="$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://127.0.0.1:5173' \
  -d '{"username":"teste.admin","password":"Admin@123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"

SCHOOL="$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"teste.admin","password":"Admin@123"}' \
  | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)"

echo "token=${TOKEN:0:12}... school=$SCHOOL"
echo "--- dashboard ---"
curl -s -w "\nHTTP %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-School-Context: ${SCHOOL:-1}" \
  -H "Origin: http://127.0.0.1:5173" \
  "$BASE/api/v1/dashboard/summary?periodDays=30" | cut -c1-400

echo
echo "===== ERRO (sem frames) ====="
docker compose logs --since=90s --no-color backend 2>&1 \
  | grep -vE '\|[[:space:]]+at ' \
  | grep -vE '\|[[:space:]]+\.\.\. [0-9]+ (more|common frames omitted)' \
  | cut -c1-400 \
  | tail -40
