#!/usr/bin/env bash
# Extrai o motivo real do backend nao subir (Flyway x Hibernate x conexao).
# Uso (no host): bash scripts/deploy/diagnose-backend-vps.sh

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "===== STATUS ====="
docker compose ps backend

echo
echo "===== HEALTH ====="
curl -s -o /dev/null -w 'http_code=%{http_code}\n' http://127.0.0.1:5173/actuator/health

echo
echo "===== ERRO (linhas relevantes) ====="
docker compose logs --tail=400 backend 2>&1 \
  | grep -E "Schema-validation|missing table|missing column|wrong column type|Caused by:|APPLICATION FAILED|Error creating bean with name '[a-zA-Z]+'" \
  | sed 's/\t/ /g' \
  | cut -c1-220 \
  | tail -25

echo
echo "===== FIM ====="
