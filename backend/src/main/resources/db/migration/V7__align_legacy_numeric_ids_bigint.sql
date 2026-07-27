-- Alinha tipos numericos das tabelas legadas usadas pelo JPA.
-- Sem dump PHP, cada ALTER e no-op se a tabela nao existir.

SET @prev_fk_checks = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

SET @has_fk_la_book = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'livros_acervos'
      AND CONSTRAINT_NAME = 'fk_la_book'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @drop_fk_la_book_sql = IF(
    @has_fk_la_book > 0,
    'ALTER TABLE livros_acervos DROP FOREIGN KEY fk_la_book',
    'SELECT 1'
);
PREPARE drop_fk_la_book_stmt FROM @drop_fk_la_book_sql;
EXECUTE drop_fk_la_book_stmt;
DEALLOCATE PREPARE drop_fk_la_book_stmt;

SET @has_author := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_author');
SET @sql_author := IF(@has_author = 0, 'SELECT 1',
    'ALTER TABLE tbl_author MODIFY COLUMN author_id BIGINT NOT NULL AUTO_INCREMENT');
PREPARE s FROM @sql_author; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_books := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_books');
SET @sql_books := IF(@has_books = 0, 'SELECT 1',
    'ALTER TABLE tbl_books MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, MODIFY COLUMN aid BIGINT NOT NULL');
PREPARE s FROM @sql_books; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_users := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_users');
SET @sql_users := IF(@has_users = 0, 'SELECT 1',
    'ALTER TABLE tbl_users MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT');
PREPARE s FROM @sql_users; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_comments := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_comments');
SET @sql_comments := IF(@has_comments = 0, 'SELECT 1',
    'ALTER TABLE tbl_comments MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, MODIFY COLUMN book_id BIGINT NOT NULL, MODIFY COLUMN user_id BIGINT NULL');
PREPARE s FROM @sql_comments; EXECUTE s; DEALLOCATE PREPARE s;

SET @has_la := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'livros_acervos');
SET @sql_la := IF(@has_la = 0, 'SELECT 1',
    'ALTER TABLE livros_acervos MODIFY COLUMN book_id BIGINT NOT NULL');
PREPARE s FROM @sql_la; EXECUTE s; DEALLOCATE PREPARE s;

SET @add_fk_la_book_sql = IF(
    @has_fk_la_book > 0 AND @has_la > 0 AND @has_books > 0,
    'ALTER TABLE livros_acervos ADD CONSTRAINT fk_la_book FOREIGN KEY (book_id) REFERENCES tbl_books (id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE add_fk_la_book_stmt FROM @add_fk_la_book_sql;
EXECUTE add_fk_la_book_stmt;
DEALLOCATE PREPARE add_fk_la_book_stmt;

SET FOREIGN_KEY_CHECKS = @prev_fk_checks;
