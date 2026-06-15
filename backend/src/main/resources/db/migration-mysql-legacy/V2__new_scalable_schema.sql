CREATE TABLE IF NOT EXISTS schema_migration_runs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    migration_key VARCHAR(100) NOT NULL,
    run_status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    details TEXT NULL,
    PRIMARY KEY (id),
    KEY idx_schema_migration_runs_started_at (started_at),
    UNIQUE KEY uk_schema_migration_runs_migration_key_status (migration_key, run_status)
);

CREATE TABLE IF NOT EXISTS core_admin_users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_admin_id BIGINT NULL,
    username VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_algorithm VARCHAR(20) NOT NULL DEFAULT 'BCRYPT',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_admin_users_username (username),
    UNIQUE KEY uk_core_admin_users_legacy_admin_id (legacy_admin_id),
    KEY idx_core_admin_users_is_active (is_active)
);

CREATE TABLE IF NOT EXISTS core_users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_user_id BIGINT NULL,
    display_name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    avatar_url VARCHAR(255) NULL,
    acervo_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_users_email (email),
    UNIQUE KEY uk_core_users_legacy_user_id (legacy_user_id),
    KEY idx_core_users_status (status),
    KEY idx_core_users_acervo (acervo_id)
);

CREATE TABLE IF NOT EXISTS core_user_identities (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(190) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_user_identities_provider_uid (provider, provider_user_id),
    KEY idx_core_user_identities_user_id (user_id),
    CONSTRAINT fk_core_user_identities_user
        FOREIGN KEY (user_id) REFERENCES core_users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS core_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_category_id BIGINT NULL,
    category_type VARCHAR(20) NOT NULL DEFAULT 'BOOK',
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_categories_slug_type (slug, category_type),
    UNIQUE KEY uk_core_categories_legacy_category_id (legacy_category_id),
    KEY idx_core_categories_type_status (category_type, is_active)
);

CREATE TABLE IF NOT EXISTS core_authors (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_author_id BIGINT NULL,
    author_type VARCHAR(20) NOT NULL DEFAULT 'BOOK',
    name VARCHAR(150) NOT NULL,
    bio TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_authors_legacy_author_id (legacy_author_id),
    KEY idx_core_authors_type_status (author_type, is_active),
    KEY idx_core_authors_name (name)
);

CREATE TABLE IF NOT EXISTS core_books (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_book_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    normalized_title VARCHAR(255) NOT NULL,
    category_id BIGINT NULL,
    author_id BIGINT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_books_legacy_book_id (legacy_book_id),
    KEY idx_core_books_title (normalized_title),
    KEY idx_core_books_status (status),
    KEY idx_core_books_category (category_id),
    KEY idx_core_books_author (author_id),
    CONSTRAINT fk_core_books_category
        FOREIGN KEY (category_id) REFERENCES core_categories (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_core_books_author
        FOREIGN KEY (author_id) REFERENCES core_authors (id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS core_comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_comment_id BIGINT NULL,
    book_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    user_display_name VARCHAR(150) NULL,
    comment_text TEXT NOT NULL,
    comment_status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_comments_legacy_comment_id (legacy_comment_id),
    KEY idx_core_comments_book_created (book_id, created_at),
    KEY idx_core_comments_user (user_id),
    KEY idx_core_comments_status (comment_status),
    CONSTRAINT fk_core_comments_book
        FOREIGN KEY (book_id) REFERENCES core_books (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_core_comments_user
        FOREIGN KEY (user_id) REFERENCES core_users (id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS core_user_activity_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legacy_log_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    platform VARCHAR(30) NULL,
    device_token VARCHAR(255) NULL,
    last_active_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_user_activity_logs_legacy_log_id (legacy_log_id),
    UNIQUE KEY uk_core_user_activity_logs_user_id (user_id),
    KEY idx_core_user_activity_logs_last_active (last_active_at),
    CONSTRAINT fk_core_user_activity_logs_user
        FOREIGN KEY (user_id) REFERENCES core_users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS core_settings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    setting_key VARCHAR(120) NOT NULL,
    setting_value TEXT NOT NULL,
    setting_group VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_core_settings_setting_key (setting_key),
    KEY idx_core_settings_group (setting_group)
);
