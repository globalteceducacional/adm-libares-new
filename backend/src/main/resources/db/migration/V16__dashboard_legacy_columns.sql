-- Colunas usadas pelo dashboard legacy que faltam nos stubs da V14.
-- Idempotente: so adiciona se a tabela existe e a coluna ainda nao.

SET @db := DATABASE();

-- tbl_users.created_at
SET @tbl_ok := (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = @db AND table_name = 'tbl_users'
);
SET @col_ok := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = @db AND table_name = 'tbl_users' AND column_name = 'created_at'
);
SET @sql := IF(
    @tbl_ok > 0 AND @col_ok = 0,
    'ALTER TABLE tbl_users ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tbl_comments.dt_rate
SET @tbl_ok := (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = @db AND table_name = 'tbl_comments'
);
SET @col_ok := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = @db AND table_name = 'tbl_comments' AND column_name = 'dt_rate'
);
SET @sql := IF(
    @tbl_ok > 0 AND @col_ok = 0,
    'ALTER TABLE tbl_comments ADD COLUMN dt_rate TIMESTAMP NULL DEFAULT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
