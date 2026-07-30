#!/usr/bin/env bash
# Importa u778451386_ebook.sql em cima de um banco que ja tem stubs Flyway.
# 1) remove so as tabelas legadas do dump (preserva app_* e flyway_schema_history)
# 2) importa o dump
# 3) recoloca school_id nos acervos e reinicia o backend
#
# Uso: bash scripts/deploy/import-legacy-dump-vps.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

DUMP="${1:-$ROOT/u778451386_ebook.sql}"
if [ ! -f "$DUMP" ]; then
  echo "!! Dump nao encontrado: $DUMP"
  exit 1
fi

echo "==> Dump: $DUMP ($(du -h "$DUMP" | awk '{print $1}'))"

echo "==> Derrubando tabelas legadas (stubs) para o dump poder recriar..."
docker compose exec -T db mysql -uroot -proot adm_libare <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
  acervos,
  livros_acervos,
  Autores_jogo,
  Autores_site,
  `Categoría_jogo`,
  `Categoría_site`,
  Comentarios_jogo,
  Comentarios_site,
  Jogos,
  rating_jogos,
  rating_sites,
  `Seções_jogo`,
  `Seções_site`,
  Sites,
  tbl_active_log,
  tbl_admin,
  tbl_author,
  tbl_books,
  tbl_book_page_notes,
  tbl_category,
  tbl_comments,
  tbl_favourite,
  tbl_home_section,
  tbl_rating,
  tbl_reading,
  tbl_settings,
  tbl_users,
  tbl_version,
  tbl_wishlist,
  `vizualização_jogo`,
  `vizualização_site`;
SET FOREIGN_KEY_CHECKS = 1;
SQL

echo "==> Importando dump..."
docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 adm_libare < "$DUMP"

echo "==> Garantindo school_id em acervos + vinculo a escola padrao..."
docker compose exec -T db mysql -uroot -proot adm_libare <<'SQL'
-- Dump legado nao tem school_id; o multi-tenant precisa da coluna.
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
  echo "==> Backend nao subiu. Ultimo erro:"
  docker compose logs --tail=60 backend | grep -vE '[[:space:]]at ' | tail -30
  exit 1
fi

echo "==> Import concluido."
