#!/usr/bin/env bash
# Repara app_* + flyway_schema_history no VPS (apos dump PHP que apagou o schema admin).
# Uso no HOST (com docker):
#   cd /opt/adm-libares-new
#   bash scripts/deploy/repair-admin-schema-vps.sh
#
# Sem docker no PATH (Terminal do contêiner adm-libare-db):
#   mysql -uroot -proot adm_libare < /caminho/nao-disponivel
#   -> cole o conteudo de repair-admin-schema.sql no Terminal do db.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
SQL="$ROOT/scripts/deploy/repair-admin-schema.sql"

if [ ! -f "$SQL" ]; then
  echo "!! Arquivo nao encontrado: $SQL"
  exit 1
fi

echo "==> Aplicando repair-admin-schema.sql..."
docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 adm_libare < "$SQL"

echo "==> Reiniciando backend..."
docker compose up -d --force-recreate backend

echo "==> Aguardando health..."
ok=0
for i in $(seq 1 45); do
  if curl -sf http://127.0.0.1:5173/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
    echo "==> OK: backend UP"
    curl -s http://127.0.0.1:5173/actuator/health; echo
    ok=1
    break
  fi
  sleep 2
done

if [ "$ok" -ne 1 ]; then
  echo "!! Backend nao subiu. Rode: bash scripts/deploy/diagnose-backend-vps.sh"
  exit 1
fi

echo "==> Login de teste (usuario inexistente = JSON esperado):"
curl -s -o /tmp/login_probe.txt -w 'http=%{http_code}\n' \
  -X POST http://127.0.0.1:5173/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"__probe__","password":"x"}'
echo "body=$(cat /tmp/login_probe.txt)"
echo
echo "Login painel: teste.admin / Admin@123"
