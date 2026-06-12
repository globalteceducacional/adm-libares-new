USE `adm_libare_core`;

SET @migration_key := 'legacy_to_core_v1';
SET @duplicate_emails_skipped := 0;

INSERT INTO `ops_migration_runs` (`migration_key`, `run_status`, `details`)
VALUES (@migration_key, 'RUNNING', 'Migracao iniciada');

INSERT INTO `app_admin_users`
  (`legacy_admin_id`, `username`, `password_hash`, `password_algorithm`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  a.id,
  TRIM(a.username),
  a.password,
  CASE WHEN LENGTH(a.password) = 32 THEN 'MD5' ELSE 'BCRYPT' END,
  1,
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_admin` a
WHERE a.username IS NOT NULL AND TRIM(a.username) <> ''
ON DUPLICATE KEY UPDATE
  `username` = VALUES(`username`),
  `password_hash` = VALUES(`password_hash`),
  `password_algorithm` = VALUES(`password_algorithm`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `app_users`
  (`legacy_user_id`, `display_name`, `email`, `phone`, `password_hash`, `user_type`, `is_active`, `avatar_ref`, `acervo_id`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  su.id,
  COALESCE(NULLIF(TRIM(su.name), ''), CONCAT('Usuario ', su.id)),
  LOWER(TRIM(su.email)),
  NULLIF(TRIM(su.phone), ''),
  NULLIF(su.password, ''),
  COALESCE(NULLIF(TRIM(su.user_type), ''), 'Normal'),
  CASE WHEN su.status = '0' THEN 0 ELSE 1 END,
  NULLIF(TRIM(su.user_image), ''),
  su.acervo_id,
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_users` su
INNER JOIN (
  SELECT LOWER(TRIM(email)) AS normalized_email, MAX(id) AS chosen_id
  FROM `adm_libare`.`tbl_users`
  WHERE email IS NOT NULL AND TRIM(email) <> ''
  GROUP BY LOWER(TRIM(email))
) dedup ON dedup.chosen_id = su.id
ON DUPLICATE KEY UPDATE
  `display_name` = VALUES(`display_name`),
  `phone` = VALUES(`phone`),
  `password_hash` = VALUES(`password_hash`),
  `user_type` = VALUES(`user_type`),
  `is_active` = VALUES(`is_active`),
  `avatar_ref` = VALUES(`avatar_ref`),
  `acervo_id` = VALUES(`acervo_id`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

SET @duplicate_emails_skipped := (
  SELECT COALESCE(SUM(group_size - 1), 0)
  FROM (
    SELECT COUNT(*) AS group_size
    FROM `adm_libare`.`tbl_users`
    WHERE email IS NOT NULL AND TRIM(email) <> ''
    GROUP BY LOWER(TRIM(email))
    HAVING COUNT(*) > 1
  ) duplicated_groups
);

INSERT INTO `app_user_identities` (`user_id`, `provider`, `provider_user_id`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  cu.id,
  UPPER(TRIM(u.user_type)),
  TRIM(u.auth_id),
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_users` u
INNER JOIN `app_users` cu ON cu.legacy_user_id = u.id
WHERE u.auth_id IS NOT NULL AND TRIM(u.auth_id) <> ''
  AND u.user_type IS NOT NULL AND TRIM(u.user_type) <> ''
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `catalog_categories` (`legacy_category_id`, `category_type`, `name`, `slug`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  c.cid,
  'BOOK',
  TRIM(c.category_name),
  LOWER(REPLACE(REPLACE(TRIM(c.category_name), ' ', '-'), '--', '-')),
  CASE WHEN c.status = '0' THEN 0 ELSE 1 END,
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_category` c
WHERE c.category_name IS NOT NULL AND TRIM(c.category_name) <> ''
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `slug` = VALUES(`slug`),
  `is_active` = VALUES(`is_active`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `catalog_authors` (`legacy_author_id`, `author_type`, `name`, `bio`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  a.author_id,
  'BOOK',
  TRIM(a.author_name),
  NULLIF(a.author_description, ''),
  CASE WHEN a.a_status = '0' THEN 0 ELSE 1 END,
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_author` a
WHERE a.author_name IS NOT NULL AND TRIM(a.author_name) <> ''
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `bio` = VALUES(`bio`),
  `is_active` = VALUES(`is_active`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `catalog_books`
  (`legacy_book_id`, `title`, `normalized_title`, `category_id`, `author_id`, `description`, `file_type`, `file_url`, `is_featured`, `views`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  b.id,
  TRIM(b.book_title),
  LOWER(TRIM(b.book_title)),
  cc.id,
  ca.id,
  NULLIF(b.book_description, ''),
  NULLIF(TRIM(b.book_file_type), ''),
  NULLIF(TRIM(b.book_file_url), ''),
  CASE WHEN b.featured = 1 THEN 1 ELSE 0 END,
  COALESCE(b.book_views, 0),
  CASE WHEN b.status = '0' THEN 0 ELSE 1 END,
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_books` b
LEFT JOIN `catalog_categories` cc ON cc.legacy_category_id = b.cat_id
LEFT JOIN `catalog_authors` ca ON ca.legacy_author_id = b.aid
WHERE b.book_title IS NOT NULL AND TRIM(b.book_title) <> ''
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `normalized_title` = VALUES(`normalized_title`),
  `category_id` = VALUES(`category_id`),
  `author_id` = VALUES(`author_id`),
  `description` = VALUES(`description`),
  `file_type` = VALUES(`file_type`),
  `file_url` = VALUES(`file_url`),
  `is_featured` = VALUES(`is_featured`),
  `views` = VALUES(`views`),
  `is_active` = VALUES(`is_active`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `engagement_comments`
  (`legacy_comment_id`, `book_id`, `user_id`, `user_name`, `user_email`, `comment_text`, `commented_at_epoch`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  c.id,
  cb.id,
  cu.id,
  NULLIF(TRIM(c.user_name), ''),
  NULLIF(TRIM(c.user_email), ''),
  c.comment_text,
  c.comment_on,
  CASE WHEN c.status = '0' THEN 0 ELSE 1 END,
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_comments` c
INNER JOIN `catalog_books` cb ON cb.legacy_book_id = c.book_id
LEFT JOIN `app_users` cu ON cu.legacy_user_id = c.user_id
WHERE c.comment_text IS NOT NULL AND TRIM(c.comment_text) <> ''
ON DUPLICATE KEY UPDATE
  `book_id` = VALUES(`book_id`),
  `user_id` = VALUES(`user_id`),
  `user_name` = VALUES(`user_name`),
  `user_email` = VALUES(`user_email`),
  `comment_text` = VALUES(`comment_text`),
  `commented_at_epoch` = VALUES(`commented_at_epoch`),
  `is_active` = VALUES(`is_active`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `app_user_activity_logs` (`legacy_log_id`, `user_id`, `player_id`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT
  al.id,
  cu.id,
  NULLIF(TRIM(al.player_id), ''),
  NULL,
  NULL,
  NULL,
  NULL
FROM `adm_libare`.`tbl_active_log` al
INNER JOIN `app_users` cu ON cu.legacy_user_id = al.user_id
ON DUPLICATE KEY UPDATE
  `player_id` = VALUES(`player_id`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `setting_group`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT 'app_name', COALESCE(s.app_name, ''), 'APP', NULL, NULL, NULL, NULL
FROM `adm_libare`.`tbl_settings` s
WHERE s.id = 1
ON DUPLICATE KEY UPDATE
  `setting_value` = VALUES(`setting_value`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `setting_group`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT 'app_logo', COALESCE(s.app_logo, ''), 'APP', NULL, NULL, NULL, NULL
FROM `adm_libare`.`tbl_settings` s
WHERE s.id = 1
ON DUPLICATE KEY UPDATE
  `setting_value` = VALUES(`setting_value`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `setting_group`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`)
SELECT 'api_latest_limit', COALESCE(CAST(s.api_latest_limit AS CHAR), ''), 'API', NULL, NULL, NULL, NULL
FROM `adm_libare`.`tbl_settings` s
WHERE s.id = 1
ON DUPLICATE KEY UPDATE
  `setting_value` = VALUES(`setting_value`),
  `deleted_by` = NULL,
  `deleted_at` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;

UPDATE `ops_migration_runs`
SET `run_status` = 'SUCCESS',
    `finished_at` = CURRENT_TIMESTAMP,
    `details` = CONCAT(
      'Migracao concluida com sucesso. Emails duplicados ignorados: ',
      @duplicate_emails_skipped
    )
WHERE `id` = (
  SELECT `id` FROM (
    SELECT `id`
    FROM `ops_migration_runs`
    WHERE `migration_key` = @migration_key
    ORDER BY `id` DESC
    LIMIT 1
  ) t
);
