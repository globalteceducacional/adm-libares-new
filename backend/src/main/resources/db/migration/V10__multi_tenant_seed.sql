-- Multi-tenant: seeds RBAC, migração acervos -> escolas, admins legados.
-- Idempotente onde possível (INSERT IGNORE / NOT EXISTS).

-- ---------------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO app_permissions (code, module, description) VALUES
    ('schools.view', 'schools', 'Visualizar escolas'),
    ('schools.create', 'schools', 'Criar escolas'),
    ('schools.update', 'schools', 'Editar escolas'),
    ('schools.delete', 'schools', 'Excluir escolas'),
    ('acervos.view', 'acervos', 'Visualizar acervos'),
    ('acervos.create', 'acervos', 'Criar acervos'),
    ('acervos.update', 'acervos', 'Editar acervos'),
    ('acervos.delete', 'acervos', 'Excluir acervos'),
    ('users.view', 'users', 'Visualizar usuarios'),
    ('users.create', 'users', 'Criar usuarios'),
    ('users.update', 'users', 'Editar usuarios'),
    ('users.delete', 'users', 'Excluir usuarios'),
    ('users.block', 'users', 'Bloquear usuarios'),
    ('roles.view', 'roles', 'Visualizar perfis'),
    ('roles.create', 'roles', 'Criar perfis'),
    ('roles.update', 'roles', 'Editar perfis'),
    ('roles.delete', 'roles', 'Excluir perfis'),
    ('books.view', 'books', 'Visualizar livros'),
    ('books.create', 'books', 'Criar livros'),
    ('books.update', 'books', 'Editar livros'),
    ('books.delete', 'books', 'Excluir livros'),
    ('loans.view', 'loans', 'Visualizar emprestimos'),
    ('loans.create', 'loans', 'Registrar emprestimos'),
    ('loans.return', 'loans', 'Registrar devolucoes'),
    ('students.manage', 'people', 'Gerenciar alunos'),
    ('teachers.manage', 'people', 'Gerenciar professores'),
    ('reports.view', 'reports', 'Visualizar relatorios'),
    ('settings.school', 'settings', 'Configuracoes da escola'),
    ('platform.impersonate', 'platform', 'Atuar no contexto de uma escola');

-- ---------------------------------------------------------------------------
-- Escolas a partir dos acervos existentes (1 escola inicial por acervo legado)
-- ---------------------------------------------------------------------------
INSERT INTO app_schools (name, slug, status)
SELECT a.nome, CONCAT('escola-', a.id), IF(a.status = 1, '1', '0')
FROM acervos a
WHERE NOT EXISTS (
    SELECT 1 FROM app_schools s WHERE s.slug = CONCAT('escola-', a.id)
);

UPDATE acervos a
INNER JOIN app_schools s ON s.slug = CONCAT('escola-', a.id)
SET a.school_id = s.id
WHERE a.school_id IS NULL;

UPDATE tbl_users u
INNER JOIN acervos a ON a.id = u.acervo_id
SET u.school_id = a.school_id
WHERE u.acervo_id IS NOT NULL
  AND u.school_id IS NULL;

-- ---------------------------------------------------------------------------
-- Role global SUPER_ADMIN
-- ---------------------------------------------------------------------------
INSERT INTO app_roles (school_id, name, is_system, status)
SELECT NULL, 'SUPER_ADMIN', 1, '1'
WHERE NOT EXISTS (
    SELECT 1 FROM app_roles r WHERE r.name = 'SUPER_ADMIN' AND r.school_id IS NULL
);

INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND r.school_id IS NULL;

-- ---------------------------------------------------------------------------
-- Role SCHOOL_ADMIN por escola (pacote amplo, sem schools.* nem platform.*)
-- ---------------------------------------------------------------------------
INSERT INTO app_roles (school_id, name, is_system, status)
SELECT s.id, 'SCHOOL_ADMIN', 1, '1'
FROM app_schools s
WHERE NOT EXISTS (
    SELECT 1 FROM app_roles r
    WHERE r.school_id = s.id AND r.name = 'SCHOOL_ADMIN'
);

INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
INNER JOIN app_permissions p ON p.code NOT IN (
    'schools.view', 'schools.create', 'schools.update', 'schools.delete', 'platform.impersonate'
)
WHERE r.name = 'SCHOOL_ADMIN'
  AND r.school_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Migrar tbl_admin -> app_admin_users (super admins globais na v1)
-- ---------------------------------------------------------------------------
INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
SELECT
    NULL,
    a.username,
    a.password,
    COALESCE(NULLIF(TRIM(a.email), ''), a.username),
    '1',
    1
FROM tbl_admin a
WHERE NOT EXISTS (
    SELECT 1 FROM app_admin_users u WHERE u.username = a.username
);

INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
SELECT u.id, r.id
FROM app_admin_users u
INNER JOIN app_roles r ON r.name = 'SUPER_ADMIN' AND r.school_id IS NULL
WHERE u.is_super_admin = 1;

-- ---------------------------------------------------------------------------
-- FKs após backfill
-- ---------------------------------------------------------------------------
SET @fk_acervos := (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'acervos'
      AND CONSTRAINT_NAME = 'fk_acervos_school'
);
SET @sql_acervos := IF(
    @fk_acervos = 0,
    'ALTER TABLE acervos ADD CONSTRAINT fk_acervos_school FOREIGN KEY (school_id) REFERENCES app_schools (id)',
    'SELECT 1'
);
PREPARE stmt_acervos FROM @sql_acervos;
EXECUTE stmt_acervos;
DEALLOCATE PREPARE stmt_acervos;

SET @fk_users := (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tbl_users'
      AND CONSTRAINT_NAME = 'fk_users_school'
);
SET @sql_users := IF(
    @fk_users = 0,
    'ALTER TABLE tbl_users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES app_schools (id)',
    'SELECT 1'
);
PREPARE stmt_users FROM @sql_users;
EXECUTE stmt_users;
DEALLOCATE PREPARE stmt_users;
