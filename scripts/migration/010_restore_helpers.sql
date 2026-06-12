USE `adm_libare_core`;

-- Helpers padronizados de restauracao logica (undo soft delete).
-- Convencao:
--   p_actor_id = usuario autenticado que executou a restauracao.
--   updated_by recebe p_actor_id.

DROP PROCEDURE IF EXISTS `sp_restore_admin_user`;
DROP PROCEDURE IF EXISTS `sp_restore_user`;
DROP PROCEDURE IF EXISTS `sp_restore_category`;
DROP PROCEDURE IF EXISTS `sp_restore_author`;
DROP PROCEDURE IF EXISTS `sp_restore_book`;
DROP PROCEDURE IF EXISTS `sp_restore_comment`;
DROP PROCEDURE IF EXISTS `sp_restore_setting`;

DELIMITER $$

CREATE PROCEDURE `sp_restore_admin_user`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `app_admin_users`
  SET `is_active` = 1,
      `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

CREATE PROCEDURE `sp_restore_user`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `app_users`
  SET `is_active` = 1,
      `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;

  UPDATE `app_user_identities`
  SET `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `user_id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

CREATE PROCEDURE `sp_restore_category`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `catalog_categories`
  SET `is_active` = 1,
      `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

CREATE PROCEDURE `sp_restore_author`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `catalog_authors`
  SET `is_active` = 1,
      `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

CREATE PROCEDURE `sp_restore_book`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `catalog_books`
  SET `is_active` = 1,
      `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

CREATE PROCEDURE `sp_restore_comment`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `engagement_comments`
  SET `is_active` = 1,
      `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

CREATE PROCEDURE `sp_restore_setting`(
  IN p_id BIGINT,
  IN p_actor_id BIGINT
)
BEGIN
  UPDATE `app_settings`
  SET `deleted_at` = NULL,
      `deleted_by` = NULL,
      `updated_by` = p_actor_id
  WHERE `id` = p_id
    AND `deleted_at` IS NOT NULL;
END$$

DELIMITER ;
