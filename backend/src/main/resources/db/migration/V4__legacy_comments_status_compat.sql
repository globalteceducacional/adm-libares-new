-- Compatibilidade para o modulo de comentarios no schema legado.
-- Adiciona coluna de status caso nao exista.

SET @has_status := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_comments'
      AND column_name = 'status'
);

SET @ddl := IF(
    @has_status = 0,
    'ALTER TABLE tbl_comments ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1'' AFTER comment_text',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
