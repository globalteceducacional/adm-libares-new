-- Permissões do módulo Site (plataforma / globais)
INSERT IGNORE INTO app_permissions (code, module, description) VALUES
    ('sites.view', 'sites', 'Visualizar Sites, autores, categorias e secoes'),
    ('sites.create', 'sites', 'Criar Sites, autores, categorias e secoes'),
    ('sites.update', 'sites', 'Editar Sites, autores, categorias e secoes'),
    ('sites.delete', 'sites', 'Excluir Sites, autores, categorias e secoes'),
    ('sites.comments.view', 'sites', 'Visualizar comentarios de Sites'),
    ('sites.comments.moderate', 'sites', 'Moderar/remover comentarios de Sites');

-- SUPER_ADMIN global recebe todas (incluindo as novas)
INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND r.school_id IS NULL;

-- Remover sites.* de SCHOOL_ADMIN existentes (caso CROSS JOIN anterior as tenha puxado)
DELETE rp FROM app_role_permissions rp
INNER JOIN app_roles r ON r.id = rp.role_id
INNER JOIN app_permissions p ON p.id = rp.permission_id
WHERE r.name = 'SCHOOL_ADMIN'
  AND r.school_id IS NOT NULL
  AND p.code IN (
    'sites.view', 'sites.create', 'sites.update', 'sites.delete',
    'sites.comments.view', 'sites.comments.moderate'
  );
