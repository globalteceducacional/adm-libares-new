USE `adm_libare_core`;

SELECT 'tbl_admin -> app_admin_users' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_admin`) AS legacy_count,
       (SELECT COUNT(*) FROM `app_admin_users` WHERE `legacy_admin_id` IS NOT NULL) AS core_count;

SELECT 'tbl_users -> app_users' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_users`) AS legacy_count,
       (SELECT COUNT(*) FROM `app_users` WHERE `legacy_user_id` IS NOT NULL) AS core_count;

SELECT 'tbl_category -> catalog_categories' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_category`) AS legacy_count,
       (SELECT COUNT(*) FROM `catalog_categories` WHERE `legacy_category_id` IS NOT NULL) AS core_count;

SELECT 'tbl_author -> catalog_authors' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_author`) AS legacy_count,
       (SELECT COUNT(*) FROM `catalog_authors` WHERE `legacy_author_id` IS NOT NULL) AS core_count;

SELECT 'tbl_books -> catalog_books' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_books`) AS legacy_count,
       (SELECT COUNT(*) FROM `catalog_books` WHERE `legacy_book_id` IS NOT NULL) AS core_count;

SELECT 'tbl_comments -> engagement_comments' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_comments`) AS legacy_count,
       (SELECT COUNT(*) FROM `engagement_comments` WHERE `legacy_comment_id` IS NOT NULL) AS core_count;

SELECT 'tbl_active_log -> app_user_activity_logs' AS check_name,
       (SELECT COUNT(*) FROM `adm_libare`.`tbl_active_log`) AS legacy_count,
       (SELECT COUNT(*) FROM `app_user_activity_logs` WHERE `legacy_log_id` IS NOT NULL) AS core_count;

SELECT 'books sem autor valido' AS check_name, COUNT(*) AS invalid_count
FROM `catalog_books` b
LEFT JOIN `catalog_authors` a ON a.id = b.author_id
WHERE b.author_id IS NOT NULL AND a.id IS NULL;

SELECT 'books sem categoria valida' AS check_name, COUNT(*) AS invalid_count
FROM `catalog_books` b
LEFT JOIN `catalog_categories` c ON c.id = b.category_id
WHERE b.category_id IS NOT NULL AND c.id IS NULL;

SELECT 'comentarios sem livro valido' AS check_name, COUNT(*) AS invalid_count
FROM `engagement_comments` c
LEFT JOIN `catalog_books` b ON b.id = c.book_id
WHERE b.id IS NULL;

SELECT 'emails duplicados em app_users' AS check_name, COUNT(*) AS duplicated_emails
FROM (
  SELECT `email`
  FROM `app_users`
  GROUP BY `email`
  HAVING COUNT(*) > 1
) d;

SELECT 'auditoria app_users sem created_at' AS check_name, COUNT(*) AS invalid_count
FROM `app_users`
WHERE `created_at` IS NULL;

SELECT 'auditoria app_users sem created_by apos criacao manual' AS check_name, COUNT(*) AS warning_count
FROM `app_users`
WHERE `legacy_user_id` IS NULL AND `created_by` IS NULL;

SELECT 'auditoria soft delete inconsistente em catalog_books' AS check_name, COUNT(*) AS invalid_count
FROM `catalog_books`
WHERE (`deleted_at` IS NOT NULL AND `is_active` <> 0)
   OR (`deleted_at` IS NULL AND `deleted_by` IS NOT NULL);

SELECT 'auditoria soft delete inconsistente em app_users' AS check_name, COUNT(*) AS invalid_count
FROM `app_users`
WHERE (`deleted_at` IS NOT NULL AND `is_active` <> 0)
   OR (`deleted_at` IS NULL AND `deleted_by` IS NOT NULL);

SELECT `id`, `migration_key`, `started_at`, `finished_at`, `run_status`, `details`
FROM `ops_migration_runs`
ORDER BY `id` DESC
LIMIT 10;
