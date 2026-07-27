-- Status legado como VARCHAR(1). No-op se a tabela nao existir.

SET @has_author := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_author');
SET @sql_author := IF(@has_author = 0, 'SELECT 1',
    'ALTER TABLE tbl_author MODIFY COLUMN a_status VARCHAR(1) NOT NULL DEFAULT ''1''');
PREPARE s FROM @sql_author; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_books := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_books');
SET @sql_books := IF(@has_books = 0, 'SELECT 1',
    'ALTER TABLE tbl_books MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1''');
PREPARE s FROM @sql_books; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_users := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_users');
SET @sql_users := IF(@has_users = 0, 'SELECT 1',
    'ALTER TABLE tbl_users MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1''');
PREPARE s FROM @sql_users; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_comments := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_comments');
SET @sql_comments := IF(@has_comments = 0, 'SELECT 1',
    'ALTER TABLE tbl_comments MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1''');
PREPARE s FROM @sql_comments; EXECUTE s; DEALLOCATE PREPARE s;
