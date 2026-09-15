-- Perfil do admin (tema/avatar), tabela Jogos quando ausente, notificacoes in-app e permissoes.
-- DDL no MySQL nao e transacional: os ADD COLUMN sao condicionais para a migracao
-- poder ser reaplicada apos falha parcial (VPS usa repair-on-migrate).

SET @add_ui_theme := IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'app_admin_users'
       AND column_name = 'ui_theme') = 0,
    'ALTER TABLE app_admin_users ADD COLUMN ui_theme VARCHAR(16) NULL',
    'DO 0'
);
PREPARE stmt FROM @add_ui_theme;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_image := IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'app_admin_users'
       AND column_name = 'image_filename') = 0,
    'ALTER TABLE app_admin_users ADD COLUMN image_filename VARCHAR(255) NULL',
    'DO 0'
);
PREPARE stmt FROM @add_image;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Catalogo de jogos do PHP legado (colunas identicas ao dump; bases ja importadas nao mudam).
-- TEXT nao aceita DEFAULT no MySQL, por isso cat_id e book_file_url ficam sem default.
CREATE TABLE IF NOT EXISTS Jogos (
    id INT NOT NULL AUTO_INCREMENT,
    cat_id TEXT NOT NULL,
    aid INT NOT NULL DEFAULT 0,
    featured INT NOT NULL DEFAULT 0,
    book_title VARCHAR(255) NOT NULL,
    book_description TEXT NOT NULL,
    book_cover_img VARCHAR(255) NOT NULL DEFAULT '',
    book_file_type VARCHAR(255) NOT NULL DEFAULT 'ludo_educativo',
    book_file_url TEXT NOT NULL,
    total_rate INT NOT NULL DEFAULT 0,
    rate_avg DECIMAL(11,2) NOT NULL DEFAULT 0.00,
    book_views INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT NULL,
    title VARCHAR(180) NOT NULL,
    body TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    onesignal_id VARCHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notif_admin (admin_user_id, is_read, created_at),
    CONSTRAINT fk_notif_admin FOREIGN KEY (admin_user_id) REFERENCES app_admin_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO app_permissions (code, module, description) VALUES
    ('settings.view', 'settings', 'Ver definicoes da aplicacao leitor'),
    ('settings.update', 'settings', 'Editar definicoes da aplicacao leitor'),
    ('games.view', 'games', 'Visualizar jogos do catalogo legado'),
    ('games.create', 'games', 'Criar jogos'),
    ('games.update', 'games', 'Editar jogos'),
    ('games.delete', 'games', 'Excluir jogos'),
    ('notifications.view', 'notifications', 'Ver notificacoes do painel'),
    ('notifications.create', 'notifications', 'Enviar notificacoes (painel e OneSignal)');

-- Apenas o SUPER_ADMIN global recebe as novas permissoes (mesmo padrao da V13).
INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND r.school_id IS NULL
  AND p.code IN (
    'settings.view', 'settings.update',
    'games.view', 'games.create', 'games.update', 'games.delete',
    'notifications.view', 'notifications.create'
  );
