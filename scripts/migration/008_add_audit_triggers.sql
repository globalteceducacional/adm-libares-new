USE `adm_libare_core`;

-- Padrao esperado no backend antes de operacoes de escrita:
-- SET @app_user_id = <id_do_usuario_autenticado>;
--
-- Se @app_user_id nao estiver definido, os campos *_by permanecem como NULL.

DROP TRIGGER IF EXISTS `trg_app_admin_users_bu_audit`;
DROP TRIGGER IF EXISTS `trg_app_admin_users_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_app_users_bu_audit`;
DROP TRIGGER IF EXISTS `trg_app_users_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_app_user_identities_bu_audit`;
DROP TRIGGER IF EXISTS `trg_app_user_identities_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_catalog_categories_bu_audit`;
DROP TRIGGER IF EXISTS `trg_catalog_categories_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_catalog_authors_bu_audit`;
DROP TRIGGER IF EXISTS `trg_catalog_authors_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_catalog_books_bu_audit`;
DROP TRIGGER IF EXISTS `trg_catalog_books_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_engagement_comments_bu_audit`;
DROP TRIGGER IF EXISTS `trg_engagement_comments_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_app_settings_bu_audit`;
DROP TRIGGER IF EXISTS `trg_app_settings_bd_block_delete`;
DROP TRIGGER IF EXISTS `trg_app_user_activity_logs_bu_audit`;
DROP TRIGGER IF EXISTS `trg_app_user_activity_logs_bd_block_delete`;

DELIMITER $$

CREATE TRIGGER `trg_app_admin_users_bu_audit`
BEFORE UPDATE ON `app_admin_users`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_app_admin_users_bd_block_delete`
BEFORE DELETE ON `app_admin_users`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em app_admin_users. Use soft delete.';
END$$

CREATE TRIGGER `trg_app_users_bu_audit`
BEFORE UPDATE ON `app_users`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_app_users_bd_block_delete`
BEFORE DELETE ON `app_users`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em app_users. Use soft delete.';
END$$

CREATE TRIGGER `trg_app_user_identities_bu_audit`
BEFORE UPDATE ON `app_user_identities`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_app_user_identities_bd_block_delete`
BEFORE DELETE ON `app_user_identities`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em app_user_identities. Use soft delete.';
END$$

CREATE TRIGGER `trg_catalog_categories_bu_audit`
BEFORE UPDATE ON `catalog_categories`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_catalog_categories_bd_block_delete`
BEFORE DELETE ON `catalog_categories`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em catalog_categories. Use soft delete.';
END$$

CREATE TRIGGER `trg_catalog_authors_bu_audit`
BEFORE UPDATE ON `catalog_authors`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_catalog_authors_bd_block_delete`
BEFORE DELETE ON `catalog_authors`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em catalog_authors. Use soft delete.';
END$$

CREATE TRIGGER `trg_catalog_books_bu_audit`
BEFORE UPDATE ON `catalog_books`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_catalog_books_bd_block_delete`
BEFORE DELETE ON `catalog_books`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em catalog_books. Use soft delete.';
END$$

CREATE TRIGGER `trg_engagement_comments_bu_audit`
BEFORE UPDATE ON `engagement_comments`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_engagement_comments_bd_block_delete`
BEFORE DELETE ON `engagement_comments`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em engagement_comments. Use soft delete.';
END$$

CREATE TRIGGER `trg_app_settings_bu_audit`
BEFORE UPDATE ON `app_settings`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_app_settings_bd_block_delete`
BEFORE DELETE ON `app_settings`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em app_settings. Use soft delete.';
END$$

CREATE TRIGGER `trg_app_user_activity_logs_bu_audit`
BEFORE UPDATE ON `app_user_activity_logs`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by);
END$$

CREATE TRIGGER `trg_app_user_activity_logs_bd_block_delete`
BEFORE DELETE ON `app_user_activity_logs`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'DELETE fisico bloqueado em app_user_activity_logs. Use soft delete.';
END$$

DELIMITER ;
