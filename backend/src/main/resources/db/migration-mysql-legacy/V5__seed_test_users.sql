-- Seed de usuarios de teste (idempotente) para ambiente local.
-- Admin usa MD5 para compatibilidade com LoginUseCase legado.

INSERT INTO tbl_admin (id, username, password, email, image)
SELECT
    COALESCE((SELECT MAX(a.id) FROM tbl_admin a), 0) + 1,
    'teste.admin',
    MD5('Admin@123'),
    'teste.admin@local.dev',
    ''
WHERE NOT EXISTS (
    SELECT 1
    FROM tbl_admin a
    WHERE a.username = 'teste.admin'
);

INSERT INTO tbl_users (
    id,
    user_type,
    user_image,
    name,
    email,
    password,
    phone,
    auth_id,
    is_deleted,
    registered_on,
    status,
    acervo_id
)
SELECT
    COALESCE((SELECT MAX(u.id) FROM tbl_users u), 0) + 1,
    'Normal',
    '',
    'Usuario Teste',
    'usuario.teste@local.dev',
    'User@123',
    '11999999999',
    '',
    0,
    CAST(UNIX_TIMESTAMP() AS CHAR),
    '1',
    NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM tbl_users u
    WHERE u.email = 'usuario.teste@local.dev'
);
