-- Seed idempotente do admin de testes. Senha validada como MD5-hex no LoginUseCase.
-- Usuario: teste.admin | Senha: Admin@123
INSERT INTO app_admin_users (username, password_hash, password_algorithm, is_active)
VALUES ('teste.admin', md5('Admin@123'), 'MD5', TRUE)
ON CONFLICT (username) DO NOTHING;
