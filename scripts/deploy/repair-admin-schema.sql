-- Repara schema admin apos perda de app_* / flyway_schema_history.
-- Uso no contêiner adm-libare-db:
--   mysql -uroot -proot adm_libare < scripts/deploy/repair-admin-schema.sql
-- Ou cole o conteudo via heredoc no Terminal do db.
--
-- Marca V1-V22 como aplicadas (validate-on-migrate=false).
-- NAO marca V25: o deploy do codigo novo aplica V25 no boot.

CREATE TABLE IF NOT EXISTS flyway_schema_history (
  installed_rank INT NOT NULL,
  version VARCHAR(50),
  description VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL,
  script VARCHAR(1000) NOT NULL,
  checksum INT NULL,
  installed_by VARCHAR(100) NOT NULL,
  installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  execution_time INT NOT NULL,
  success TINYINT(1) NOT NULL,
  PRIMARY KEY (installed_rank)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS app_schools (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  status VARCHAR(1) NOT NULL DEFAULT '1',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_school_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  UNIQUE KEY uk_permission_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT NULL,
  name VARCHAR(100) NOT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(1) NOT NULL DEFAULT '1',
  UNIQUE KEY uk_role_school_name (school_id, name),
  CONSTRAINT fk_role_school FOREIGN KEY (school_id) REFERENCES app_schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES app_roles (id),
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES app_permissions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_admin_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  status VARCHAR(1) NOT NULL DEFAULT '1',
  is_super_admin TINYINT(1) NOT NULL DEFAULT 0,
  perm_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_username (username),
  CONSTRAINT fk_admin_school FOREIGN KEY (school_id) REFERENCES app_schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_admin_user_roles (
  admin_user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (admin_user_id, role_id),
  CONSTRAINT fk_aur_user FOREIGN KEY (admin_user_id) REFERENCES app_admin_users (id),
  CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES app_roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_admin_user_schools (
  admin_user_id BIGINT NOT NULL,
  school_id BIGINT NOT NULL,
  PRIMARY KEY (admin_user_id, school_id),
  CONSTRAINT fk_aus_admin FOREIGN KEY (admin_user_id) REFERENCES app_admin_users (id) ON DELETE CASCADE,
  CONSTRAINT fk_aus_school FOREIGN KEY (school_id) REFERENCES app_schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpa e regrava historico ate V22 (sem V25).
DELETE FROM flyway_schema_history;

INSERT INTO flyway_schema_history
(installed_rank,version,description,type,script,checksum,installed_by,execution_time,success) VALUES
(1,'1','baseline','SQL','V1__baseline.sql',NULL,'repair',0,1),
(2,'2','new scalable schema','SQL','V2__new_scalable_schema.sql',NULL,'repair',0,1),
(3,'3','migration validation audit','SQL','V3__migration_validation_audit.sql',NULL,'repair',0,1),
(4,'4','legacy comments status compat','SQL','V4__legacy_comments_status_compat.sql',NULL,'repair',0,1),
(5,'5','seed test users','SQL','V5__seed_test_users.sql',NULL,'repair',0,1),
(6,'6','align tbl admin id bigint','SQL','V6__align_tbl_admin_id_bigint.sql',NULL,'repair',0,1),
(7,'7','align legacy numeric ids bigint','SQL','V7__align_legacy_numeric_ids_bigint.sql',NULL,'repair',0,1),
(8,'8','align legacy status columns as varchar','SQL','V8__align_legacy_status_columns_as_varchar.sql',NULL,'repair',0,1),
(9,'9','multi tenant schema','SQL','V9__multi_tenant_schema.sql',NULL,'repair',0,1),
(10,'10','multi tenant seed','SQL','V10__multi_tenant_seed.sql',NULL,'repair',0,1),
(11,'11','Drop tbl_admin and rehash panel admin passwords to BCrypt','JDBC','V11__DropLegacyAdmin',NULL,'repair',0,1),
(12,'12','admin user schools','SQL','V12__admin_user_schools.sql',NULL,'repair',0,1),
(13,'13','site permissions','SQL','V13__site_permissions.sql',NULL,'repair',0,1),
(14,'14','legacy stub tables empty vps','SQL','V14__legacy_stub_tables_empty_vps.sql',NULL,'repair',0,1),
(15,'15','default school for fresh install','SQL','V15__default_school_for_fresh_install.sql',NULL,'repair',0,1),
(16,'16','dashboard legacy columns','SQL','V16__dashboard_legacy_columns.sql',NULL,'repair',0,1),
(17,'17','compat columns after php dump','SQL','V17__compat_columns_after_php_dump.sql',NULL,'repair',0,1),
(18,'20','tbl active log','SQL','V20__tbl_active_log.sql',NULL,'repair',0,1),
(19,'21','reader social tables','SQL','V21__reader_social_tables.sql',NULL,'repair',0,1),
(20,'22','tbl settings reader','SQL','V22__tbl_settings_reader.sql',NULL,'repair',0,1);

INSERT IGNORE INTO app_permissions (code, module, description) VALUES
 ('schools.view','schools','Visualizar escolas'),
 ('schools.create','schools','Criar escolas'),
 ('schools.update','schools','Editar escolas'),
 ('schools.delete','schools','Excluir escolas'),
 ('acervos.view','acervos','Visualizar acervos'),
 ('acervos.create','acervos','Criar acervos'),
 ('acervos.update','acervos','Editar acervos'),
 ('acervos.delete','acervos','Excluir acervos'),
 ('users.view','users','Visualizar usuarios'),
 ('users.create','users','Criar usuarios'),
 ('users.update','users','Editar usuarios'),
 ('users.delete','users','Excluir usuarios'),
 ('books.view','books','Visualizar livros'),
 ('books.create','books','Criar livros'),
 ('books.update','books','Editar livros'),
 ('books.delete','books','Excluir livros'),
 ('platform.impersonate','platform','Atuar no contexto de uma escola');

INSERT INTO app_roles (school_id, name, is_system, status)
SELECT NULL, 'SUPER_ADMIN', 1, '1'
WHERE NOT EXISTS (
  SELECT 1 FROM app_roles WHERE name = 'SUPER_ADMIN' AND school_id IS NULL
);

INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'SUPER_ADMIN' AND r.school_id IS NULL;

-- Senha: Admin@123 (BCrypt)
INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
SELECT NULL, 'teste.admin',
  '$2a$10$KoQtOP3.PeMssbev98aNyOBALw.ua2ZpX.FRk3NRSyrgmlNmz6xFO',
  'teste.admin@local.dev', '1', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM app_admin_users WHERE username = 'teste.admin');

INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
SELECT u.id, r.id
FROM app_admin_users u
INNER JOIN app_roles r ON r.name = 'SUPER_ADMIN' AND r.school_id IS NULL
WHERE u.username = 'teste.admin';

SELECT 'REPAIR_OK' AS status;
SELECT id, username, status, is_super_admin FROM app_admin_users;
SELECT COUNT(*) AS flyway_rows FROM flyway_schema_history;
