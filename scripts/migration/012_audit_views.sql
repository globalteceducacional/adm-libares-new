USE `adm_libare_core`;

-- Views reutilizaveis para auditoria no backend/admin.

DROP VIEW IF EXISTS `vw_audit_module_summary`;
DROP VIEW IF EXISTS `vw_audit_recent_user_changes`;
DROP VIEW IF EXISTS `vw_audit_recent_book_changes`;
DROP VIEW IF EXISTS `vw_audit_recent_soft_deletes`;
DROP VIEW IF EXISTS `vw_audit_actor_activity`;
DROP VIEW IF EXISTS `vw_audit_soft_delete_consistency`;

CREATE VIEW `vw_audit_module_summary` AS
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

CREATE VIEW `vw_audit_recent_user_changes` AS
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
FROM `app_users` u;

CREATE VIEW `vw_audit_recent_book_changes` AS
SELECT
  b.id,
  b.title,
  b.created_by,
  b.created_at,
  b.updated_by,
  b.updated_at,
  b.deleted_by,
  b.deleted_at
FROM `catalog_books` b;

CREATE VIEW `vw_audit_recent_soft_deletes` AS
SELECT
  'app_users' AS module_name,
  CAST(u.id AS CHAR) AS entity_id,
  u.display_name AS entity_label,
  u.deleted_by,
  u.deleted_at
FROM `app_users` u
WHERE u.deleted_at IS NOT NULL
UNION ALL
SELECT
  'catalog_books',
  CAST(b.id AS CHAR),
  b.title,
  b.deleted_by,
  b.deleted_at
FROM `catalog_books` b
WHERE b.deleted_at IS NOT NULL
UNION ALL
SELECT
  'engagement_comments',
  CAST(c.id AS CHAR),
  LEFT(c.comment_text, 120),
  c.deleted_by,
  c.deleted_at
FROM `engagement_comments` c
WHERE c.deleted_at IS NOT NULL;

CREATE VIEW `vw_audit_actor_activity` AS
SELECT actor_id, COUNT(*) AS total_changes
FROM (
  SELECT u.updated_by AS actor_id FROM `app_users` u WHERE u.updated_by IS NOT NULL
  UNION ALL
  SELECT b.updated_by AS actor_id FROM `catalog_books` b WHERE b.updated_by IS NOT NULL
  UNION ALL
  SELECT c.updated_by AS actor_id FROM `engagement_comments` c WHERE c.updated_by IS NOT NULL
) x
GROUP BY actor_id;

CREATE VIEW `vw_audit_soft_delete_consistency` AS
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
