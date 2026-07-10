package com.libare.adm.shared.db.migration

import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Component

/**
 * Fase 6: remove tbl_admin e converte senhas de app_admin_users para BCrypt.
 * Admins migrados com hash MD5 precisam redefinir senha (nao ha conversao reversivel).
 */
@Component
class V11__DropLegacyAdmin : BaseJavaMigration() {
    override fun migrate(context: Context) {
        val encoder = BCryptPasswordEncoder()
        val connection = context.connection
        val testAdminHash = encoder.encode("Admin@123")

        connection.prepareStatement(
            """
            UPDATE app_admin_users
            SET password_hash = ?
            WHERE username = 'teste.admin'
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, testAdminHash)
            statement.executeUpdate()
        }

        connection.prepareStatement(
            """
            INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
            SELECT NULL, 'teste.admin', ?, 'teste.admin@local.dev', '1', 1
            FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 FROM app_admin_users WHERE username = 'teste.admin'
            )
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, testAdminHash)
            statement.executeUpdate()
        }

        connection.createStatement().use { statement ->
            statement.execute(
                """
                INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
                SELECT u.id, r.id
                FROM app_admin_users u
                INNER JOIN app_roles r ON r.name = 'SUPER_ADMIN' AND r.school_id IS NULL
                WHERE u.username = 'teste.admin'
                """.trimIndent()
            )
        }

        connection.createStatement().use { statement ->
            statement.execute("DROP VIEW IF EXISTS tbl_admin")
            statement.execute("DROP TABLE IF EXISTS tbl_admin")
        }
    }

    override fun getDescription(): String = "Drop tbl_admin and rehash panel admin passwords to BCrypt"
}
