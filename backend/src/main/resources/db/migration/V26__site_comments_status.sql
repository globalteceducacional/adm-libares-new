-- Adiciona coluna de status para moderacao em Comentarios_site.
-- status '1' = aprovado (visivel), '0' = rejeitado (oculto no app).
-- Registros existentes ficam aprovados por padrao (DEFAULT '1').
SET @sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name   = 'Comentarios_site'
       AND column_name  = 'status') = 0,
    'ALTER TABLE `Comentarios_site` ADD COLUMN `status` VARCHAR(1) NOT NULL DEFAULT ''1''',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
