-- Apos import do dump PHP, colunas exigidas pelo multi-tenant / dashboard
-- podem faltar. Idempotente.

SET @db := DATABASE();

-- tbl_users.school_id
SET @ok := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'tbl_users' AND column_name = 'school_id'
);
SET @sql := IF(@ok = 0,
  'ALTER TABLE tbl_users ADD COLUMN school_id BIGINT NULL, ADD KEY idx_tbl_users_school (school_id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Preenche school_id a partir do acervo (ou escola padrao)
UPDATE tbl_users u
LEFT JOIN acervos a ON a.id = u.acervo_id
SET u.school_id = COALESCE(
  a.school_id,
  (SELECT id FROM app_schools ORDER BY id LIMIT 1)
)
WHERE u.school_id IS NULL;

-- tbl_comments.status (dashboard legacy filtra status = '1')
SET @ok := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'tbl_comments' AND column_name = 'status'
);
SET @sql := IF(@ok = 0,
  'ALTER TABLE tbl_comments ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT ''1''',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
