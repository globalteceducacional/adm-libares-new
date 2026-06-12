USE `adm_libare_core`;

-- Helpers padronizados de soft delete.
-- Convencao:
--   p_actor_id = usuario autenticado que executou a exclusao logica.
--   Se p_actor_id for NULL, o deleted_by permanece NULL.

DROP PROCEDURE IF EXISTS `sp_soft_delete_admin_user`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_user`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_category`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_author`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_book`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_comment`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_setting`;

DELIMITER $$

CREATE PROCEDURE `sp_soft_delete_admin_user`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `app_admin_users`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;
END$$

CREATE PROCEDURE `sp_soft_delete_user`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  -- 1) Usuario
  UPDATE `app_users`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;

  -- 2) Identidades vinculadas
  UPDATE `app_user_identities`
  SET `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `user_id` = p_id
    AND `deleted_at` IS NULL;

  -- 3) Comentarios do usuario (mantem historico textual, mas desativa)
  UPDATE `engagement_comments`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `user_id` = p_id
    AND `deleted_at` IS NULL;

  -- 4) Logs de atividade
  UPDATE `app_user_activity_logs`
  SET `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `user_id` = p_id
    AND `deleted_at` IS NULL;
END$$

CREATE PROCEDURE `sp_soft_delete_category`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  -- 1) Categoria
  UPDATE `catalog_categories`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;

  -- 2) Livros da categoria
  UPDATE `catalog_books`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `category_id` = p_id
    AND `deleted_at` IS NULL;

  -- 3) Comentarios dos livros impactados
  UPDATE `engagement_comments` cm
  INNER JOIN `catalog_books` b ON b.id = cm.book_id
  SET cm.`is_active` = 0,
      cm.`deleted_at` = CURRENT_TIMESTAMP,
      cm.`deleted_by` = p_actor_id,
      cm.`updated_by` = p_actor_id
  WHERE b.`category_id` = p_id
    AND cm.`deleted_at` IS NULL;
END$$

CREATE PROCEDURE `sp_soft_delete_author`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  -- 1) Autor
  UPDATE `catalog_authors`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;

  -- 2) Livros do autor
  UPDATE `catalog_books`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `author_id` = p_id
    AND `deleted_at` IS NULL;

  -- 3) Comentarios dos livros impactados
  UPDATE `engagement_comments` cm
  INNER JOIN `catalog_books` b ON b.id = cm.book_id
  SET cm.`is_active` = 0,
      cm.`deleted_at` = CURRENT_TIMESTAMP,
      cm.`deleted_by` = p_actor_id,
      cm.`updated_by` = p_actor_id
  WHERE b.`author_id` = p_id
    AND cm.`deleted_at` IS NULL;
END$$

CREATE PROCEDURE `sp_soft_delete_book`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  -- 1) Livro
  UPDATE `catalog_books`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;

  -- 2) Comentarios do livro
  UPDATE `engagement_comments`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `book_id` = p_id
    AND `deleted_at` IS NULL;
END$$

CREATE PROCEDURE `sp_soft_delete_comment`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `engagement_comments`
  SET `is_active` = 0,
      `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;
END$$

CREATE PROCEDURE `sp_soft_delete_setting`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `app_settings`
  SET `deleted_at` = CURRENT_TIMESTAMP,
      `deleted_by` = p_actor_id,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NULL;
END$$

DELIMITER ;
