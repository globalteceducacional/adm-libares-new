CREATE DATABASE IF NOT EXISTS `adm_libare_core`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `adm_libare_core`;

CREATE TABLE IF NOT EXISTS `ops_migration_runs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `migration_key` VARCHAR(120) NOT NULL,
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_at` TIMESTAMP NULL,
  `run_status` VARCHAR(20) NOT NULL,
  `details` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ops_migration_runs_started_at` (`started_at`),
  KEY `idx_ops_migration_runs_status` (`run_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_admin_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_admin_id` BIGINT NULL,
  `username` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_algorithm` VARCHAR(20) NOT NULL DEFAULT 'MD5',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_admin_users_username` (`username`),
  UNIQUE KEY `uk_app_admin_users_legacy_admin_id` (`legacy_admin_id`),
  KEY `idx_app_admin_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_user_id` BIGINT NULL,
  `display_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `password_hash` VARCHAR(255) NULL,
  `user_type` VARCHAR(30) NOT NULL DEFAULT 'Normal',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `avatar_ref` VARCHAR(255) NULL,
  `acervo_id` BIGINT NULL,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_users_email` (`email`),
  UNIQUE KEY `uk_app_users_legacy_user_id` (`legacy_user_id`),
  KEY `idx_app_users_is_active` (`is_active`),
  KEY `idx_app_users_acervo_id` (`acervo_id`),
  KEY `idx_app_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_user_identities` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `provider` VARCHAR(30) NOT NULL,
  `provider_user_id` VARCHAR(190) NOT NULL,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_user_identities_provider_uid` (`provider`, `provider_user_id`),
  KEY `idx_app_user_identities_user` (`user_id`),
  KEY `idx_app_user_identities_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `catalog_categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_category_id` BIGINT NULL,
  `category_type` VARCHAR(20) NOT NULL DEFAULT 'BOOK',
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_catalog_categories_type_slug` (`category_type`, `slug`),
  UNIQUE KEY `uk_catalog_categories_legacy_id` (`legacy_category_id`),
  KEY `idx_catalog_categories_type_status` (`category_type`, `is_active`),
  KEY `idx_catalog_categories_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `catalog_authors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_author_id` BIGINT NULL,
  `author_type` VARCHAR(20) NOT NULL DEFAULT 'BOOK',
  `name` VARCHAR(150) NOT NULL,
  `bio` LONGTEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_catalog_authors_legacy_id` (`legacy_author_id`),
  KEY `idx_catalog_authors_type_status` (`author_type`, `is_active`),
  KEY `idx_catalog_authors_name` (`name`),
  KEY `idx_catalog_authors_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `catalog_books` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_book_id` BIGINT NULL,
  `title` VARCHAR(255) NOT NULL,
  `normalized_title` VARCHAR(255) NOT NULL,
  `category_id` BIGINT NULL,
  `author_id` BIGINT NULL,
  `description` LONGTEXT NULL,
  `file_type` VARCHAR(100) NULL,
  `file_url` TEXT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `views` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_catalog_books_legacy_id` (`legacy_book_id`),
  KEY `idx_catalog_books_is_active` (`is_active`),
  KEY `idx_catalog_books_title` (`normalized_title`),
  KEY `idx_catalog_books_category` (`category_id`),
  KEY `idx_catalog_books_author` (`author_id`),
  KEY `idx_catalog_books_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `engagement_comments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_comment_id` BIGINT NULL,
  `book_id` BIGINT NOT NULL,
  `user_id` BIGINT NULL,
  `user_name` VARCHAR(150) NULL,
  `user_email` VARCHAR(190) NULL,
  `comment_text` LONGTEXT NOT NULL,
  `commented_at_epoch` BIGINT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_engagement_comments_legacy_id` (`legacy_comment_id`),
  KEY `idx_engagement_comments_book` (`book_id`),
  KEY `idx_engagement_comments_user` (`user_id`),
  KEY `idx_engagement_comments_is_active` (`is_active`),
  KEY `idx_engagement_comments_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(120) NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `setting_group` VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_settings_key` (`setting_key`),
  KEY `idx_app_settings_group` (`setting_group`),
  KEY `idx_app_settings_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_user_activity_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `legacy_log_id` BIGINT NULL,
  `user_id` BIGINT NOT NULL,
  `player_id` VARCHAR(255) NULL,
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` BIGINT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_user_activity_logs_legacy_id` (`legacy_log_id`),
  UNIQUE KEY `uk_app_user_activity_logs_user` (`user_id`),
  KEY `idx_app_user_activity_logs_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS `add_fk_if_missing`;

DELIMITER $$
CREATE PROCEDURE `add_fk_if_missing`(
  IN p_table_name VARCHAR(128),
  IN p_constraint_name VARCHAR(128),
  IN p_fk_sql TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = p_table_name
      AND constraint_name = p_constraint_name
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    SET @fk_ddl = p_fk_sql;
    PREPARE stmt FROM @fk_ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL `add_fk_if_missing`(
  'app_user_identities',
  'fk_app_user_identities_user',
  'ALTER TABLE app_user_identities ADD CONSTRAINT fk_app_user_identities_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE'
);

CALL `add_fk_if_missing`(
  'catalog_books',
  'fk_catalog_books_category',
  'ALTER TABLE catalog_books ADD CONSTRAINT fk_catalog_books_category FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE SET NULL'
);

CALL `add_fk_if_missing`(
  'catalog_books',
  'fk_catalog_books_author',
  'ALTER TABLE catalog_books ADD CONSTRAINT fk_catalog_books_author FOREIGN KEY (author_id) REFERENCES catalog_authors(id) ON DELETE SET NULL'
);

CALL `add_fk_if_missing`(
  'engagement_comments',
  'fk_engagement_comments_book',
  'ALTER TABLE engagement_comments ADD CONSTRAINT fk_engagement_comments_book FOREIGN KEY (book_id) REFERENCES catalog_books(id) ON DELETE CASCADE'
);

CALL `add_fk_if_missing`(
  'engagement_comments',
  'fk_engagement_comments_user',
  'ALTER TABLE engagement_comments ADD CONSTRAINT fk_engagement_comments_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL'
);

CALL `add_fk_if_missing`(
  'app_user_activity_logs',
  'fk_app_user_activity_logs_user',
  'ALTER TABLE app_user_activity_logs ADD CONSTRAINT fk_app_user_activity_logs_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE'
);

DROP PROCEDURE IF EXISTS `add_fk_if_missing`;
