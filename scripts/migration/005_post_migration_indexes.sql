USE `adm_libare_core`;

-- Indices complementares para consultas do painel administrativo
-- Execute apos a carga inicial, quando os dados ja estiverem migrados.

DROP PROCEDURE IF EXISTS `add_index_if_missing`;

DELIMITER $$
CREATE PROCEDURE `add_index_if_missing`(
  IN p_table_name VARCHAR(128),
  IN p_index_name VARCHAR(128),
  IN p_index_sql TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name
  ) THEN
    SET @ddl = p_index_sql;
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL `add_index_if_missing`(
  'catalog_books',
  'idx_catalog_books_featured_active',
  'CREATE INDEX idx_catalog_books_featured_active ON catalog_books (is_featured, is_active)'
);

CALL `add_index_if_missing`(
  'catalog_books',
  'idx_catalog_books_views',
  'CREATE INDEX idx_catalog_books_views ON catalog_books (views)'
);

CALL `add_index_if_missing`(
  'catalog_books',
  'idx_catalog_books_created_at',
  'CREATE INDEX idx_catalog_books_created_at ON catalog_books (created_at)'
);

CALL `add_index_if_missing`(
  'engagement_comments',
  'idx_engagement_comments_book_active',
  'CREATE INDEX idx_engagement_comments_book_active ON engagement_comments (book_id, is_active)'
);

CALL `add_index_if_missing`(
  'engagement_comments',
  'idx_engagement_comments_user_active',
  'CREATE INDEX idx_engagement_comments_user_active ON engagement_comments (user_id, is_active)'
);

CALL `add_index_if_missing`(
  'engagement_comments',
  'idx_engagement_comments_created_at',
  'CREATE INDEX idx_engagement_comments_created_at ON engagement_comments (created_at)'
);

CALL `add_index_if_missing`(
  'app_users',
  'idx_app_users_type_active',
  'CREATE INDEX idx_app_users_type_active ON app_users (user_type, is_active)'
);

CALL `add_index_if_missing`(
  'app_users',
  'idx_app_users_created_at',
  'CREATE INDEX idx_app_users_created_at ON app_users (created_at)'
);

CALL `add_index_if_missing`(
  'app_users',
  'idx_app_users_display_name',
  'CREATE INDEX idx_app_users_display_name ON app_users (display_name)'
);

CALL `add_index_if_missing`(
  'app_user_activity_logs',
  'idx_app_user_activity_logs_updated_at',
  'CREATE INDEX idx_app_user_activity_logs_updated_at ON app_user_activity_logs (updated_at)'
);

CALL `add_index_if_missing`(
  'ops_migration_runs',
  'idx_ops_migration_runs_key_started',
  'CREATE INDEX idx_ops_migration_runs_key_started ON ops_migration_runs (migration_key, started_at)'
);

DROP PROCEDURE IF EXISTS `add_index_if_missing`;
