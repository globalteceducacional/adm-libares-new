USE `adm_libare_core`;

SET @rollback_key := 'legacy_to_core_v1';

INSERT INTO `ops_migration_runs` (`migration_key`, `run_status`, `details`)
VALUES (@rollback_key, 'ROLLBACK_RUNNING', 'Rollback de dados iniciado');

SET FOREIGN_KEY_CHECKS = 0;

-- Ordem de rollback logico: tabelas filhas -> tabelas pai
UPDATE `engagement_comments`
SET `is_active` = 0, `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_comment_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `app_user_identities`
SET `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `deleted_at` IS NULL;

UPDATE `app_user_activity_logs`
SET `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_log_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `catalog_books`
SET `is_active` = 0, `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_book_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `catalog_authors`
SET `is_active` = 0, `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_author_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `catalog_categories`
SET `is_active` = 0, `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_category_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `app_users`
SET `is_active` = 0, `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_user_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `app_admin_users`
SET `is_active` = 0, `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `legacy_admin_id` IS NOT NULL AND `deleted_at` IS NULL;

UPDATE `app_settings`
SET `deleted_at` = CURRENT_TIMESTAMP, `deleted_by` = NULL
WHERE `setting_key` IN ('app_name', 'app_logo', 'api_latest_limit') AND `deleted_at` IS NULL;

SET FOREIGN_KEY_CHECKS = 1;

UPDATE `ops_migration_runs`
SET `run_status` = 'ROLLBACK_SUCCESS',
    `finished_at` = CURRENT_TIMESTAMP,
    `details` = 'Rollback concluido com sucesso.'
WHERE `id` = (
  SELECT `id` FROM (
    SELECT `id`
    FROM `ops_migration_runs`
    WHERE `migration_key` = @rollback_key
    ORDER BY `id` DESC
    LIMIT 1
  ) t
);
