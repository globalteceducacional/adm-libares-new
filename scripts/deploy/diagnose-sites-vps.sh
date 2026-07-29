#!/usr/bin/env bash
# Reproduz o erro dos endpoints /api/v1/sites* e mostra a causa no log do backend.
# Uso (no host): bash scripts/deploy/diagnose-sites-vps.sh

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

BASE="http://127.0.0.1:5173"

echo "===== NOMES REAIS DAS TABELAS (com HEX para ver acentos) ====="
docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 -e \
  "SELECT table_name, HEX(table_name) AS hex_name FROM information_schema.tables
    WHERE table_schema='adm_libare'
      AND (table_name LIKE '%site%' OR table_name LIKE '%Site%');"

echo
echo "===== ESTRUTURA DE Autores_site ====="
docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 -e \
  "SHOW CREATE TABLE adm_libare.\`Autores_site\`;" 2>&1 | tail -5

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
echo "===== CHAMANDO ENDPOINTS (com corpo da resposta) ====="
for ep in /api/v1/site-authors /api/v1/sites; do
  echo "--- $ep"
  curl -s -w '\nHTTP %{http_code}\n' -H "Authorization: Bearer $TOKEN" "$BASE$ep" | cut -c1-600
done

echo
echo "===== ERRO NO BACKEND (frames 'at ...' removidos) ====="
# Sem os frames da pilha sobra a mensagem da excecao e a cadeia de "Caused by",
# que e exatamente o que identifica a causa raiz.
docker compose logs --since=90s --no-color backend 2>&1 \
  | grep -vE '\|[[:space:]]+at ' \
  | grep -vE '\|[[:space:]]+\.\.\. [0-9]+ (more|common frames omitted)' \
  | cut -c1-400 \
  | tail -40

echo
echo "===== FIM ====="
