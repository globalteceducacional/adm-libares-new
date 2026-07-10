-- Vinculo N:N entre admins do painel e escolas (multi-escola por usuario).

CREATE TABLE app_admin_user_schools (
    admin_user_id BIGINT NOT NULL,
    school_id     BIGINT NOT NULL,
    PRIMARY KEY (admin_user_id, school_id),
    CONSTRAINT fk_aus_admin FOREIGN KEY (admin_user_id) REFERENCES app_admin_users (id) ON DELETE CASCADE,
    CONSTRAINT fk_aus_school FOREIGN KEY (school_id) REFERENCES app_schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO app_admin_user_schools (admin_user_id, school_id)
SELECT id, school_id
FROM app_admin_users
WHERE school_id IS NOT NULL
  AND is_super_admin = 0;
