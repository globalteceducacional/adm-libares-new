-- Mantém compatibilidade do schema legado com o mapeamento atual do backend.
-- As entidades tratam status como String ("0"/"1").
ALTER TABLE tbl_author
    MODIFY COLUMN a_status VARCHAR(1) NOT NULL DEFAULT '1';

ALTER TABLE tbl_books
    MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT '1';

ALTER TABLE tbl_users
    MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT '1';

ALTER TABLE tbl_comments
    MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT '1';
