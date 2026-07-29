-- Instalacao nova (sem dump PHP) nao tem acervos, logo a V10 nao cria escola alguma.
-- Sem escola o super admin fica sem contexto de tenant e o painel responde 403.
-- Cria uma escola + acervo padrao apenas quando o ambiente esta vazio.
--
-- MySQL exige FROM DUAL para usar WHERE em um SELECT sem tabela de origem.

SET @school_count := (SELECT COUNT(*) FROM app_schools);

INSERT INTO app_schools (name, slug, status)
SELECT 'Escola Padrao', 'escola-padrao', '1'
FROM DUAL
WHERE @school_count = 0;

-- uk_role_school_name (school_id, name) garante idempotencia via INSERT IGNORE.
INSERT IGNORE INTO app_roles (school_id, name, is_system, status)
SELECT s.id, 'SCHOOL_ADMIN', 1, '1'
FROM app_schools s;

-- Papel de escola recebe tudo, menos o que e exclusivo da plataforma.
INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
INNER JOIN app_permissions p ON p.code NOT IN (
    'schools.view', 'schools.create', 'schools.update', 'schools.delete',
    'platform.impersonate',
    'sites.view', 'sites.create', 'sites.update', 'sites.delete',
    'sites.comments.view', 'sites.comments.moderate'
)
WHERE r.name = 'SCHOOL_ADMIN'
  AND r.school_id IS NOT NULL;

-- Acervo padrao vinculado a escola, para permitir cadastrar livros de imediato.
SET @acervo_count := (SELECT COUNT(*) FROM acervos);
SET @default_school_id := (SELECT id FROM app_schools ORDER BY id LIMIT 1);

INSERT INTO acervos (nome, descricao, status, school_id)
SELECT 'Acervo Padrao', 'Acervo criado automaticamente na instalacao', 1, @default_school_id
FROM DUAL
WHERE @acervo_count = 0
  AND @default_school_id IS NOT NULL;
