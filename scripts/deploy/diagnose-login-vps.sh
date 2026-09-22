#!/usr/bin/env bash
# Descobre por que POST /api/v1/auth/login devolve 401 de corpo vazio.
#
# O 401 vazio nao distingue "credencial invalida" de 404/500: enquanto /error
# exigir autenticacao, todo erro vira 401 sem corpo. Este script coleta a
# evidencia que falta (camada de proxy, tabelas app_*, stacktrace real).
#
# Uso (no host, dentro de /opt/adm-libares-new):
#   bash scripts/deploy/diagnose-login-vps.sh

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Usuario proposital que nao existe: nao testa senha real, so o caminho da
# requisicao. Backend saudavel responde {"message":"Credenciais invalidas"}.
PROBE='{"username":"__probe_diagnostico__","password":"__probe__"}'

mysql_db() {
  docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 "$@"
}

echo "===== 1. CONTAINERS ====="
docker compose ps

echo
echo "===== 2. LOGIN VIA NGINX DO FRONTEND (porta 5173) ====="
# Corpo vazio aqui = erro mascarado; corpo JSON = backend respondeu de verdade.
curl -s -o /tmp/login_5173.txt -w 'http_code=%{http_code} len=%{size_download}\n' \
  -X POST http://127.0.0.1:5173/api/v1/auth/login \
  -H 'Content-Type: application/json' -d "$PROBE"
echo "body: $(cat /tmp/login_5173.txt)"

echo
echo "===== 3. LOGIN DIRETO NO BACKEND (sem nginx) ====="
# Se aqui responder JSON e no passo 2 nao, o problema esta no proxy.
docker compose exec -T backend sh -lc \
  "curl -s -o /tmp/direct.txt -w 'http_code=%{http_code} len=%{size_download}\n' \
   -X POST http://127.0.0.1:8080/api/v1/auth/login \
   -H 'Content-Type: application/json' -d '$PROBE'; echo \"body: \$(cat /tmp/direct.txt)\"" \
  2>/dev/null || echo "(curl indisponivel na imagem do backend — use os passos 2 e 6)"

echo
echo "===== 4. TABELAS app_* PRESENTES ====="
mysql_db -N -e "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'adm_libare' AND table_name LIKE 'app\_%'
ORDER BY table_name;"

echo
echo "===== 5. app_admin_users (estrutura e linhas) ====="
# Colunas que a entidade PanelAdminUserEntity exige; ausencia de qualquer uma
# derruba a consulta de login em runtime (ddl-auto=none nao avisa no boot).
mysql_db -N -e "
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'adm_libare' AND table_name = 'app_admin_users'
ORDER BY ordinal_position;"
mysql_db adm_libare -e "SELECT id, username, status, school_id, is_super_admin FROM app_admin_users;" \
  || echo "!! consulta falhou: tabela ausente ou coluna divergente (causa provavel do 401 vazio)"

echo
echo "===== 6. STACKTRACE DA TENTATIVA DE LOGIN ====="
# A sonda dos passos 2/3 acabou de rodar, entao o erro esta no fim do log.
docker compose logs --tail=250 --no-color backend 2>&1 \
  | grep -iE "Exception|Caused by:|SQLSyntaxError|Unknown column|doesn't exist|ERROR" \
  | cut -c1-220 \
  | tail -25

echo
echo "===== 7. FLYWAY (ultimas migracoes) ====="
mysql_db adm_libare -e "
SELECT installed_rank, version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;" || echo "!! flyway_schema_history ausente"

echo
echo "===== FIM ====="
