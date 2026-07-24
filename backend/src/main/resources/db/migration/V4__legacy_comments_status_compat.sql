-- Compatibilidade para o modulo de comentarios no schema legado.
-- Adiciona coluna de status caso a tabela exista e a coluna nao exista.
-- Se tbl_comments ainda nao foi importada do PHP, a migration e no-op (nao falha).

SET @has_table := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_comments'
);

SET @has_status := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_comments'
      AND column_name = 'status'
);

SET @ddl := IF(
    @has_table = 0,
    'SELECT ''tbl_comments ausente — pulando V4 (importe o dump legado)'' AS info',
    IF(
        @has_status = 0,
        'ALTER TABLE tbl_comments ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1'' AFTER comment_text',
        'SELECT 1'
    )
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
