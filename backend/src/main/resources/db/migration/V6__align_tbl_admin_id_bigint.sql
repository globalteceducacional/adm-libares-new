-- Alinha tbl_admin.id para BIGINT quando a tabela legada existe.
-- Sem dump PHP (ou apos V11), a migration e no-op.

SET @has_admin := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_admin'
);

SET @ddl := IF(
    @has_admin = 0,
    'SELECT ''tbl_admin ausente — pulando V6'' AS info',
    'ALTER TABLE tbl_admin MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
