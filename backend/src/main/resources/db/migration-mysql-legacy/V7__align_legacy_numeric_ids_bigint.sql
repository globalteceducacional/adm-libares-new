-- Alinha tipos numéricos das tabelas legadas usadas pelo JPA.
-- As entidades mapeiam ids e relacionamentos como Long (BIGINT).
SET @prev_fk_checks = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- FK legada que depende de tbl_books.id.
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

ALTER TABLE tbl_author
    MODIFY COLUMN author_id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE tbl_books
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN aid BIGINT NOT NULL;

ALTER TABLE tbl_users
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE tbl_comments
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN book_id BIGINT NOT NULL,
    MODIFY COLUMN user_id BIGINT NULL;

ALTER TABLE livros_acervos
    MODIFY COLUMN book_id BIGINT NOT NULL;

SET @add_fk_la_book_sql = IF(
    @has_fk_la_book > 0,
    'ALTER TABLE livros_acervos ADD CONSTRAINT fk_la_book FOREIGN KEY (book_id) REFERENCES tbl_books (id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE add_fk_la_book_stmt FROM @add_fk_la_book_sql;
EXECUTE add_fk_la_book_stmt;
DEALLOCATE PREPARE add_fk_la_book_stmt;

SET FOREIGN_KEY_CHECKS = @prev_fk_checks;
