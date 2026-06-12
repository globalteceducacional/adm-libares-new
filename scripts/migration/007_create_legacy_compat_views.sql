USE `adm_libare_core`;

CREATE OR REPLACE VIEW `tbl_admin` AS
SELECT
  au.id,
  au.username,
  au.password_hash AS password
FROM `app_admin_users` au
WHERE au.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_users` AS
SELECT
  u.id,
  u.display_name AS name,
  u.email,
  u.phone,
  u.password_hash AS password,
  u.user_type,
  u.avatar_ref AS user_image,
  CASE WHEN u.is_active = 1 THEN '1' ELSE '0' END AS status,
  u.acervo_id
FROM `app_users` u
WHERE u.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_category` AS
SELECT
  c.id AS cid,
  c.name AS category_name,
  '' AS category_image,
  CASE WHEN c.is_active = 1 THEN '1' ELSE '0' END AS status
FROM `catalog_categories` c
WHERE c.category_type = 'BOOK'
  AND c.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_author` AS
SELECT
  a.id AS author_id,
  a.name AS author_name,
  '' AS author_image,
  COALESCE(a.bio, '') AS author_description,
  CASE WHEN a.is_active = 1 THEN '1' ELSE '0' END AS a_status
FROM `catalog_authors` a
WHERE a.author_type = 'BOOK'
  AND a.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_books` AS
SELECT
  b.id,
  b.category_id AS cat_id,
  b.author_id AS aid,
  b.is_featured AS featured,
  b.title AS book_title,
  COALESCE(b.description, '') AS book_description,
  '' AS book_cover_img,
  COALESCE(b.file_type, '') AS book_file_type,
  COALESCE(b.file_url, '') AS book_file_url,
  0 AS total_rate,
  0.00 AS rate_avg,
  b.views AS book_views,
  CASE WHEN b.is_active = 1 THEN '1' ELSE '0' END AS status
FROM `catalog_books` b
WHERE b.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_comments` AS
SELECT
  c.id,
  c.book_id,
  c.user_id,
  COALESCE(c.user_name, '') AS user_name,
  COALESCE(c.user_email, '') AS user_email,
  '' AS user_image,
  '' AS user_type,
  c.comment_text,
  c.commented_at_epoch AS comment_on,
  CASE WHEN c.is_active = 1 THEN '1' ELSE '0' END AS status
FROM `engagement_comments` c
WHERE c.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_active_log` AS
SELECT
  l.id,
  l.user_id,
  COALESCE(l.player_id, '') AS player_id,
  l.created_at,
  l.updated_at
FROM `app_user_activity_logs` l
WHERE l.deleted_at IS NULL;

CREATE OR REPLACE VIEW `tbl_settings` AS
SELECT
  1 AS id,
  COALESCE(MAX(CASE WHEN s.setting_key = 'app_name' THEN s.setting_value END), '') AS app_name,
  COALESCE(MAX(CASE WHEN s.setting_key = 'app_logo' THEN s.setting_value END), '') AS app_logo,
  COALESCE(MAX(CASE WHEN s.setting_key = 'api_latest_limit' THEN s.setting_value END), '10') AS api_latest_limit,
  '' AS api_cat_order_by,
  '' AS api_cat_post_order_by,
  '' AS api_author_order_by,
  '' AS api_author_post_order_by
FROM `app_settings` s
WHERE s.deleted_at IS NULL;
