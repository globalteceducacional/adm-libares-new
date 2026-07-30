#!/usr/bin/env bash
# Importa u778451386_ebook.sql em cima de stubs Flyway.
# Derruba dinamicamente tabelas legadas (preserva app_* e flyway_schema_history),
# usando o nome EXATO do information_schema (resolve acentos Categoría_/Seções_).
#
# Uso: bash scripts/deploy/import-legacy-dump-vps.sh [caminho-do-dump]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

DUMP="${1:-$ROOT/u778451386_ebook.sql}"
if [ ! -f "$DUMP" ]; then
  echo "!! Dump nao encontrado: $DUMP"
  exit 1
fi

mysql_db() {
  docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 "$@"
}

echo "==> Dump: $DUMP ($(du -h "$DUMP" | awk '{print $1}'))"

echo "==> Derrubando tabelas legadas (preserva app_* e flyway)..."
mapfile -t TABLES < <(mysql_db -N -e "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'adm_libare'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'app\_%'
  AND table_name <> 'flyway_schema_history'
ORDER BY table_name;
")

mysql_db adm_libare -e "SET FOREIGN_KEY_CHECKS=0;"
for t in "${TABLES[@]:-}"; do
  t="${t//$'\r'/}"
  [ -z "$t" ] && continue
  echo "    DROP $t"
  mysql_db adm_libare -e "SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS \`$t\`;"
done
mysql_db adm_libare -e "SET FOREIGN_KEY_CHECKS=1;"

echo "==> Restantes:"
mysql_db -N -e "SELECT table_name FROM information_schema.tables WHERE table_schema='adm_libare' ORDER BY 1;"

echo "==> Importando dump..."
mysql_db adm_libare < "$DUMP"

echo "==> school_id em acervos/users + status em comments..."
mysql_db adm_libare <<'SQL'
-- acervos.school_id
SET @col := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'adm_libare' AND table_name = 'acervos' AND column_name = 'school_id'
);
SET @sql := IF(@col = 0,
  'ALTER TABLE acervos ADD COLUMN school_id BIGINT NULL, ADD KEY idx_acervos_school (school_id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE acervos
SET school_id = (SELECT id FROM app_schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

-- tbl_users.school_id (listagem /api/v1/users filtra por tenant)
SET @col := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'adm_libare' AND table_name = 'tbl_users' AND column_name = 'school_id'
);
SET @sql := IF(@col = 0,
  'ALTER TABLE tbl_users ADD COLUMN school_id BIGINT NULL, ADD KEY idx_tbl_users_school (school_id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE tbl_users u
LEFT JOIN acervos a ON a.id = u.acervo_id
SET u.school_id = COALESCE(
  a.school_id,
  (SELECT id FROM app_schools ORDER BY id LIMIT 1)
)
WHERE u.school_id IS NULL;

-- tbl_comments.status (dashboard)
SET @col := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'adm_libare' AND table_name = 'tbl_comments' AND column_name = 'status'
);
SET @sql := IF(@col = 0,
  'ALTER TABLE tbl_comments ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1''',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'books' t, COUNT(*) c FROM tbl_books
UNION SELECT 'authors', COUNT(*) FROM tbl_author
UNION SELECT 'sites', COUNT(*) FROM Sites
UNION SELECT 'site_authors', COUNT(*) FROM Autores_site
UNION SELECT 'acervos', COUNT(*) FROM acervos
UNION SELECT 'users', COUNT(*) FROM tbl_users;
SQL

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
  echo "==> Backend nao subiu:"
  docker compose logs --tail=80 --no-color backend 2>&1 | grep -vE '[[:space:]]at ' | tail -40
  exit 1
fi

echo "==> Import concluido."
