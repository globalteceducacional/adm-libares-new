package db.migration

import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

/**
 * Permissao team.toggle_status para SCHOOL_ADMIN e SUPER_ADMIN
 * (ativar/desativar membros da equipe do painel).
 */
class V24__TeamToggleStatusPermission : BaseJavaMigration() {
    override fun migrate(context: Context) {
        context.connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'team.toggle_status', 'team', 'Ativar/desativar membros da equipe do painel'
                FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM app_permissions WHERE code = 'team.toggle_status'
                )
                """.trimIndent()
            )

            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code = 'team.toggle_status'
                WHERE r.name IN ('SCHOOL_ADMIN', 'SUPER_ADMIN')
                """.trimIndent()
            )
        }
    }

    override fun getDescription(): String =
        "team.toggle_status permission for SCHOOL_ADMIN and SUPER_ADMIN"
}
