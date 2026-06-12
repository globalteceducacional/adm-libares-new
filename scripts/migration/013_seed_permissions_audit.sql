USE `adm_libare_core`;

-- Permissoes de leitura para relatorios de auditoria.
-- Estrategia:
-- 1) Cria role dedicada somente leitura de auditoria.
-- 2) Concede SELECT nas views de auditoria.
-- 3) (Opcional) associa a role a um usuario de aplicacao informado.
--
-- Ajuste opcional antes de executar:
--   SET @audit_app_user := 'app_backend';
--   SET @audit_app_host := '%';
--
-- Se @audit_app_user for NULL, a etapa opcional de associacao e ignorada.

SET @audit_role_name := 'role_audit_readonly';
SET @audit_app_user := NULL;
SET @audit_app_host := '%';

DROP PROCEDURE IF EXISTS `sp_seed_audit_permissions`;

DELIMITER $$
CREATE PROCEDURE `sp_seed_audit_permissions`()
BEGIN
  SET @sql_create_role = CONCAT('CREATE ROLE IF NOT EXISTS `', @audit_role_name, '`');
  PREPARE stmt FROM @sql_create_role;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET @sql_grant_1 = CONCAT(
    'GRANT SELECT ON `adm_libare_core`.`vw_audit_module_summary` TO `', @audit_role_name, '`'
  );
  PREPARE stmt FROM @sql_grant_1;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET @sql_grant_2 = CONCAT(
    'GRANT SELECT ON `adm_libare_core`.`vw_audit_recent_user_changes` TO `', @audit_role_name, '`'
  );
  PREPARE stmt FROM @sql_grant_2;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET @sql_grant_3 = CONCAT(
    'GRANT SELECT ON `adm_libare_core`.`vw_audit_recent_book_changes` TO `', @audit_role_name, '`'
  );
  PREPARE stmt FROM @sql_grant_3;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET @sql_grant_4 = CONCAT(
    'GRANT SELECT ON `adm_libare_core`.`vw_audit_recent_soft_deletes` TO `', @audit_role_name, '`'
  );
  PREPARE stmt FROM @sql_grant_4;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET @sql_grant_5 = CONCAT(
    'GRANT SELECT ON `adm_libare_core`.`vw_audit_actor_activity` TO `', @audit_role_name, '`'
  );
  PREPARE stmt FROM @sql_grant_5;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET @sql_grant_6 = CONCAT(
    'GRANT SELECT ON `adm_libare_core`.`vw_audit_soft_delete_consistency` TO `', @audit_role_name, '`'
  );
  PREPARE stmt FROM @sql_grant_6;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  IF @audit_app_user IS NOT NULL AND LENGTH(TRIM(@audit_app_user)) > 0 THEN
    SET @sql_grant_role_to_user = CONCAT(
      'GRANT `', @audit_role_name, '` TO `', REPLACE(@audit_app_user, '`', ''), '`@`',
      REPLACE(@audit_app_host, '`', ''), '`'
    );
    PREPARE stmt FROM @sql_grant_role_to_user;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @sql_set_default_role = CONCAT(
      'SET DEFAULT ROLE `', @audit_role_name, '` TO `', REPLACE(@audit_app_user, '`', ''), '`@`',
      REPLACE(@audit_app_host, '`', ''), '`'
    );
    PREPARE stmt FROM @sql_set_default_role;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL `sp_seed_audit_permissions`();

DROP PROCEDURE IF EXISTS `sp_seed_audit_permissions`;
