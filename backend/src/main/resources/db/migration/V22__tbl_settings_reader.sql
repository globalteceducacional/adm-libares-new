-- Settings do app leitor (app_details). Só cria se ainda não existir.
CREATE TABLE IF NOT EXISTS tbl_settings (
    id INT NOT NULL,
    app_name VARCHAR(255) NOT NULL DEFAULT '',
    onesignal_rest_key TEXT NULL,
    onesignal_app_id TEXT NULL,
    app_logo VARCHAR(255) NOT NULL DEFAULT '',
    app_email VARCHAR(255) NOT NULL DEFAULT '',
    app_version VARCHAR(255) NOT NULL DEFAULT '',
    app_author VARCHAR(255) NOT NULL DEFAULT '',
    app_contact VARCHAR(255) NOT NULL DEFAULT '',
    app_website VARCHAR(255) NOT NULL DEFAULT '',
    app_description TEXT NOT NULL,
    api_latest_limit INT NOT NULL DEFAULT 10,
    api_cat_order_by VARCHAR(255) NOT NULL DEFAULT 'DESC',
    api_cat_post_order_by VARCHAR(255) NOT NULL DEFAULT 'DESC',
    api_author_order_by VARCHAR(255) NOT NULL DEFAULT 'author_id DESC',
    api_author_post_order_by VARCHAR(255) NOT NULL DEFAULT 'DESC',
    app_privacy_policy TEXT NOT NULL,
    publisher_id VARCHAR(255) NOT NULL DEFAULT '',
    interstital_ad_id VARCHAR(255) NOT NULL DEFAULT '',
    interstital_ad_id_status INT NOT NULL DEFAULT 1,
    banner_ad_id VARCHAR(255) NOT NULL DEFAULT '',
    banner_ad_id_status INT NOT NULL DEFAULT 1,
    interstital_ad_id_ios VARCHAR(255) NOT NULL DEFAULT '',
    interstital_ad_id_ios_status INT NOT NULL DEFAULT 1,
    banner_ad_id_ios VARCHAR(255) NOT NULL DEFAULT '',
    banner_ad_id_ios_status INT NOT NULL DEFAULT 1,
    app_open_ad_id VARCHAR(255) NOT NULL DEFAULT '',
    app_open_ad_id_status INT NOT NULL DEFAULT 1,
    ios_app_open_ad_id VARCHAR(255) NOT NULL DEFAULT '',
    ios_app_open_ad_id_status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tbl_settings (
    id, app_name, app_logo, app_email, app_version, app_author, app_contact, app_website,
    app_description, api_latest_limit, api_cat_order_by, api_cat_post_order_by,
    api_author_order_by, api_author_post_order_by, app_privacy_policy, publisher_id,
    interstital_ad_id, banner_ad_id, interstital_ad_id_ios, banner_ad_id_ios,
    app_open_ad_id, ios_app_open_ad_id
)
SELECT
    1, 'ADM Painel', '', '', '1.0', '', '', '',
    '', 10, 'DESC', 'DESC',
    'author_id DESC', 'DESC', '', '',
    '', '', '', '',
    '', ''
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tbl_settings WHERE id = 1);
