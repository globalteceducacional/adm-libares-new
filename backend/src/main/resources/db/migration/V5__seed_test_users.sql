-- Seed de usuarios de teste (idempotente).
-- Apos V11, tbl_admin nao existe mais — nesse caso a migration e no-op.

SET @has_admin := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_admin'
);

SET @has_users := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_users'
);

SET @admin_sql := IF(
    @has_admin = 0,
    'SELECT ''tbl_admin ausente — pulando seed admin (V11+)'' AS info',
    'INSERT INTO tbl_admin (id, username, password, email, image)
     SELECT
         COALESCE((SELECT MAX(a.id) FROM tbl_admin a), 0) + 1,
         ''teste.admin'',
         MD5(''Admin@123''),
         ''teste.admin@local.dev'',
         ''''
     WHERE NOT EXISTS (
         SELECT 1 FROM tbl_admin a WHERE a.username = ''teste.admin''
     )'
);

PREPARE stmt_admin FROM @admin_sql;
EXECUTE stmt_admin;
DEALLOCATE PREPARE stmt_admin;

SET @users_sql := IF(
    @has_users = 0,
    'SELECT ''tbl_users ausente — pulando seed usuario'' AS info',
    'INSERT INTO tbl_users (
         id, user_type, user_image, name, email, password, phone,
         auth_id, is_deleted, registered_on, status, acervo_id
     )
     SELECT
         COALESCE((SELECT MAX(u.id) FROM tbl_users u), 0) + 1,
         ''Normal'',
         '''',
         ''Usuario Teste'',
         ''usuario.teste@local.dev'',
         ''User@123'',
         ''11999999999'',
         '''',
         0,
         CAST(UNIX_TIMESTAMP() AS CHAR),
         ''1'',
         NULL
     WHERE NOT EXISTS (
         SELECT 1 FROM tbl_users u WHERE u.email = ''usuario.teste@local.dev''
     )'
);

PREPARE stmt_users FROM @users_sql;
EXECUTE stmt_users;
DEALLOCATE PREPARE stmt_users;
