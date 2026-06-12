USE `adm_libare_core`;

-- Smoke test rapido da base estruturada
-- Objetivo: validar se os modulos principais conseguem ler dados consistentes.

-- 1) Volumes basicos
SELECT 'app_admin_users' AS table_name, COUNT(*) AS total_rows FROM `app_admin_users` WHERE `deleted_at` IS NULL
UNION ALL
SELECT 'app_users', COUNT(*) FROM `app_users` WHERE `deleted_at` IS NULL
UNION ALL
SELECT 'catalog_categories', COUNT(*) FROM `catalog_categories` WHERE `deleted_at` IS NULL
UNION ALL
SELECT 'catalog_authors', COUNT(*) FROM `catalog_authors` WHERE `deleted_at` IS NULL
UNION ALL
SELECT 'catalog_books', COUNT(*) FROM `catalog_books` WHERE `deleted_at` IS NULL
UNION ALL
SELECT 'engagement_comments', COUNT(*) FROM `engagement_comments` WHERE `deleted_at` IS NULL;

-- 2) Leituras tipicas do modulo de livros
SELECT
  b.id,
  b.title,
  b.is_active,
  a.name AS author_name,
  c.name AS category_name
FROM `catalog_books` b
LEFT JOIN `catalog_authors` a ON a.id = b.author_id
LEFT JOIN `catalog_categories` c ON c.id = b.category_id
WHERE b.deleted_at IS NULL
ORDER BY b.id DESC
LIMIT 10;

-- 3) Leituras tipicas do modulo de usuarios
SELECT
  u.id,
  u.display_name,
  u.email,
  u.user_type,
  u.is_active
FROM `app_users` u
WHERE u.deleted_at IS NULL
ORDER BY u.id DESC
LIMIT 10;

-- 4) Leituras tipicas do modulo de comentarios
SELECT
  cm.id,
  cm.comment_text,
  cm.is_active,
  u.display_name AS user_name,
  b.title AS book_title
FROM `engagement_comments` cm
LEFT JOIN `app_users` u ON u.id = cm.user_id
LEFT JOIN `catalog_books` b ON b.id = cm.book_id
WHERE cm.deleted_at IS NULL
ORDER BY cm.id DESC
LIMIT 10;

-- 5) Integridade minima (esperado: 0 linhas)
SELECT
  'books_without_author_or_category' AS check_name,
  COUNT(*) AS invalid_count
FROM `catalog_books` b
WHERE b.deleted_at IS NULL
  AND (b.author_id IS NULL OR b.category_id IS NULL)
UNION ALL
SELECT
  'comments_without_book',
  COUNT(*)
FROM `engagement_comments` cm
LEFT JOIN `catalog_books` b ON b.id = cm.book_id
WHERE cm.deleted_at IS NULL
  AND b.id IS NULL;
