-- Multi-tenant: escolas (tenant) + RBAC do painel admin.
-- Fase 0.1: schema base. FKs em acervos/tbl_users e seeds ficam em V10.

CREATE TABLE app_schools (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    slug       VARCHAR(80)  NOT NULL,
    status     VARCHAR(1)   NOT NULL DEFAULT '1',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_school_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_permissions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(80)  NOT NULL,
    module      VARCHAR(50)  NOT NULL,
    description VARCHAR(255) NOT NULL,
    UNIQUE KEY uk_permission_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_roles (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id  BIGINT       NULL,
    name       VARCHAR(100) NOT NULL,
    is_system  TINYINT(1)   NOT NULL DEFAULT 0,
    status     VARCHAR(1)   NOT NULL DEFAULT '1',
    UNIQUE KEY uk_role_school_name (school_id, name),
    CONSTRAINT fk_role_school FOREIGN KEY (school_id) REFERENCES app_schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES app_roles (id),
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES app_permissions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_admin_users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id      BIGINT       NULL,
    username       VARCHAR(100) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    name           VARCHAR(150) NOT NULL,
    status         VARCHAR(1)   NOT NULL DEFAULT '1',
    is_super_admin TINYINT(1)   NOT NULL DEFAULT 0,
    perm_version   INT          NOT NULL DEFAULT 1,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_admin_username (username),
    CONSTRAINT fk_admin_school FOREIGN KEY (school_id) REFERENCES app_schools (id),
    CONSTRAINT chk_super_school CHECK (
        (is_super_admin = 1 AND school_id IS NULL)
        OR (is_super_admin = 0 AND school_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_admin_user_roles (
    admin_user_id BIGINT NOT NULL,
    role_id       BIGINT NOT NULL,
    PRIMARY KEY (admin_user_id, role_id),
    CONSTRAINT fk_aur_user FOREIGN KEY (admin_user_id) REFERENCES app_admin_users (id),
    CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES app_roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE acervos
    ADD COLUMN school_id BIGINT NULL,
    ADD INDEX idx_acervos_school (school_id);

ALTER TABLE tbl_users
    ADD COLUMN school_id BIGINT NULL,
    ADD INDEX idx_users_school (school_id);
