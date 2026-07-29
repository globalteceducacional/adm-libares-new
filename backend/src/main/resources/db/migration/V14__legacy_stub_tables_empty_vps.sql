-- Stubs minimos das tabelas legadas PHP para VPS sem dump importado.
-- Permite Hibernate ddl-auto=validate subir o backend (catalogo/site vazios).
-- CREATE IF NOT EXISTS: seguro se o dump real ja existir.

CREATE TABLE IF NOT EXISTS tbl_author (
    author_id BIGINT NOT NULL AUTO_INCREMENT,
    author_name VARCHAR(255) NOT NULL,
    author_image VARCHAR(255) NOT NULL DEFAULT '',
    author_description LONGTEXT NULL,
    a_status VARCHAR(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_category (
    cid INT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    category_image VARCHAR(255) NOT NULL DEFAULT '',
    cat_status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (cid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_books (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cat_id VARCHAR(250) NOT NULL,
    section_ids TEXT NULL,
    aid BIGINT NOT NULL,
    featured INT NOT NULL DEFAULT 0,
    book_title VARCHAR(100) NOT NULL,
    book_description LONGTEXT NOT NULL,
    book_cover_img VARCHAR(255) NOT NULL,
    book_file_type VARCHAR(255) NOT NULL,
    book_file_url VARCHAR(255) NOT NULL,
    total_rate INT NOT NULL DEFAULT 0,
    rate_avg VARCHAR(255) NOT NULL DEFAULT '0',
    book_views INT NOT NULL DEFAULT 0,
    status VARCHAR(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(40) NULL,
    user_type VARCHAR(30) NOT NULL DEFAULT 'Normal',
    user_image VARCHAR(255) NULL,
    auth_id VARCHAR(255) NOT NULL DEFAULT '',
    is_deleted INT NOT NULL DEFAULT 0,
    registered_on VARCHAR(200) NOT NULL DEFAULT '',
    acervo_id INT NULL,
    school_id BIGINT NULL,
    status VARCHAR(1) NOT NULL DEFAULT '1',
    created_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tbl_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    book_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    user_name VARCHAR(150) NULL,
    comment_text TEXT NOT NULL,
    status VARCHAR(1) NOT NULL DEFAULT '1',
    comment_on VARCHAR(255) NULL,
    dt_rate TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_home_section (
    id INT NOT NULL AUTO_INCREMENT,
    section_title VARCHAR(150) NOT NULL,
    section_books LONGTEXT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acervos (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1,
    school_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_acervos_school (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS livros_acervos (
    id INT NOT NULL AUTO_INCREMENT,
    book_id BIGINT NOT NULL,
    acervo_id INT NOT NULL,
    PRIMARY KEY (id),
    KEY idx_la_book (book_id),
    KEY idx_la_acervo (acervo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Sites (
    id INT NOT NULL AUTO_INCREMENT,
    cat_id VARCHAR(250) NOT NULL,
    aid INT NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    book_description LONGTEXT NOT NULL,
    book_cover_img VARCHAR(255) NOT NULL,
    book_file_type VARCHAR(255) NOT NULL,
    book_file_url VARCHAR(255) NOT NULL,
    featured INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    total_rate INT NOT NULL DEFAULT 0,
    rate_avg VARCHAR(255) NOT NULL DEFAULT '0',
    book_views INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Autores_site` (
    author_id INT NOT NULL AUTO_INCREMENT,
    author_name VARCHAR(255) NOT NULL,
    author_image VARCHAR(255) NOT NULL DEFAULT '',
    author_description LONGTEXT NULL,
    a_status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Categoría_site` (
    cid INT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    category_image VARCHAR(255) NOT NULL DEFAULT '',
    cat_status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (cid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Seções_site` (
    id INT NOT NULL AUTO_INCREMENT,
    section_title VARCHAR(150) NOT NULL,
    section_books LONGTEXT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Comentarios_site (
    id INT NOT NULL AUTO_INCREMENT,
    book_id INT NOT NULL,
    user_id INT NOT NULL DEFAULT 0,
    user_type VARCHAR(255) NOT NULL DEFAULT '',
    user_name VARCHAR(255) NOT NULL DEFAULT '',
    user_image VARCHAR(255) NOT NULL DEFAULT '',
    user_email VARCHAR(255) NOT NULL DEFAULT '',
    comment_text MEDIUMTEXT NOT NULL,
    dt_rate TIMESTAMP NULL DEFAULT NULL,
    comment_on VARCHAR(255) NOT NULL DEFAULT '',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
