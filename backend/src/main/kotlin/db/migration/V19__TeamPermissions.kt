package db.migration

import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

class V19__TeamPermissions : BaseJavaMigration() {
    override fun migrate(context: Context) {
        val connection = context.connection
        connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'team.view', 'team', 'Listar equipe do painel'
                FROM DUAL
                WHERE NOT EXISTS (SELECT 1 FROM app_permissions WHERE code = 'team.view')
                """.trimIndent()
            )
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'team.create', 'team', 'Criar membros da equipe do painel'
                FROM DUAL
                WHERE NOT EXISTS (SELECT 1 FROM app_permissions WHERE code = 'team.create')
                """.trimIndent()
            )
            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code IN ('team.view', 'team.create')
                WHERE r.name IN ('SCHOOL_ADMIN', 'SUPER_ADMIN')
                """.trimIndent()
            )
        }
    }
}
