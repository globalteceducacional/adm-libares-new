USE `adm_libare_core`;

-- Relatorios prontos de auditoria para operacao e painel administrativo.
-- Todos retornam dados recentes primeiro.

-- 1) Resumo geral por modulo (ativos vs excluidos logicamente)
SELECT 'app_admin_users' AS module_name,
       COUNT(*) AS total_rows,
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) AS active_rows,
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) AS soft_deleted_rows
FROM `app_admin_users`
UNION ALL
SELECT 'app_users',
       COUNT(*),
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END),
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END)
FROM `app_users`
UNION ALL
SELECT 'catalog_categories',
       COUNT(*),
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END),
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END)
FROM `catalog_categories`
UNION ALL
SELECT 'catalog_authors',
       COUNT(*),
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END),
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END)
FROM `catalog_authors`
UNION ALL
SELECT 'catalog_books',
       COUNT(*),
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END),
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END)
FROM `catalog_books`
UNION ALL
SELECT 'engagement_comments',
       COUNT(*),
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END),
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END)
FROM `engagement_comments`
UNION ALL
SELECT 'app_settings',
       COUNT(*),
       SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END),
       SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END)
FROM `app_settings`;

-- 2) Ultimas criacoes e alteracoes em usuarios
SELECT
  u.id,
  u.display_name,
  u.email,
  u.created_by,
  u.created_at,
  u.updated_by,
  u.updated_at,
  u.deleted_by,
  u.deleted_at
FROM `app_users` u
ORDER BY COALESCE(u.updated_at, u.created_at) DESC
LIMIT 100;

-- 3) Ultimas criacoes e alteracoes em livros
SELECT
  b.id,
  b.title,
  b.created_by,
  b.created_at,
  b.updated_by,
  b.updated_at,
  b.deleted_by,
  b.deleted_at
FROM `catalog_books` b
ORDER BY COALESCE(b.updated_at, b.created_at) DESC
LIMIT 100;

-- 4) Exclusoes logicas recentes (usuarios)
SELECT
  u.id,
  u.display_name,
  u.email,
  u.deleted_by,
  u.deleted_at
FROM `app_users` u
WHERE u.deleted_at IS NOT NULL
ORDER BY u.deleted_at DESC
LIMIT 100;

-- 5) Exclusoes logicas recentes (livros)
SELECT
  b.id,
  b.title,
  b.deleted_by,
  b.deleted_at
FROM `catalog_books` b
WHERE b.deleted_at IS NOT NULL
ORDER BY b.deleted_at DESC
LIMIT 100;

-- 6) Possiveis restauracoes (deleted_at NULL apos ter sido alterado por ator)
-- Heuristica: registros ativos com updated_by preenchido e updated_at > created_at.
SELECT
  u.id,
  u.display_name,
  u.email,
  u.updated_by AS possible_restored_by,
  u.updated_at AS possible_restored_at
FROM `app_users` u
WHERE u.deleted_at IS NULL
  AND u.updated_by IS NOT NULL
  AND u.updated_at > u.created_at
ORDER BY u.updated_at DESC
LIMIT 100;

-- 7) Top atores que mais alteraram registros (usuarios + livros + comentarios)
SELECT actor_id, COUNT(*) AS total_changes
FROM (
  SELECT u.updated_by AS actor_id FROM `app_users` u WHERE u.updated_by IS NOT NULL
  UNION ALL
  SELECT b.updated_by AS actor_id FROM `catalog_books` b WHERE b.updated_by IS NOT NULL
  UNION ALL
  SELECT c.updated_by AS actor_id FROM `engagement_comments` c WHERE c.updated_by IS NOT NULL
) x
GROUP BY actor_id
ORDER BY total_changes DESC
LIMIT 20;

-- 8) Consistencia de auditoria em soft delete
SELECT 'users_deleted_without_deleted_by' AS check_name, COUNT(*) AS invalid_count
FROM `app_users`
WHERE deleted_at IS NOT NULL AND deleted_by IS NULL
UNION ALL
SELECT 'books_deleted_without_deleted_by', COUNT(*)
FROM `catalog_books`
WHERE deleted_at IS NOT NULL AND deleted_by IS NULL
UNION ALL
SELECT 'comments_deleted_without_deleted_by', COUNT(*)
FROM `engagement_comments`
WHERE deleted_at IS NOT NULL AND deleted_by IS NULL;
