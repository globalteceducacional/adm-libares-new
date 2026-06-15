-- Alinha o schema legado ao mapeamento JPA atual.
-- AdminUserEntity.id usa Long, então a coluna precisa ser BIGINT.
ALTER TABLE tbl_admin
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
