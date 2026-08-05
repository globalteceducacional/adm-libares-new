package db.migration

import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

/**
 * Permissao sites.toggle_status + sites.view/toggle para role PROFESSOR
 * (mesmo padrao de books.view + books.toggle_status).
 *
 * Numeracao V23: V20–V22 ja usados pelas migrations SQL do reader API.
 */
class V23__SiteToggleStatusForProfessor : BaseJavaMigration() {
    override fun migrate(context: Context) {
        context.connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'sites.toggle_status', 'sites', 'Ativar/desativar conteudos Site'
                FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM app_permissions WHERE code = 'sites.toggle_status'
                )
                """.trimIndent()
            )

            // PROFESSOR: ver + ativar/desativar sites (espelho dos livros)
            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code IN ('sites.view', 'sites.toggle_status')
                WHERE r.name = 'PROFESSOR' AND r.school_id IS NOT NULL
                """.trimIndent()
            )

            // SUPER_ADMIN tambem pode toggle (alem de CRUD completo)
            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code = 'sites.toggle_status'
                WHERE r.name = 'SUPER_ADMIN' AND r.school_id IS NULL
                """.trimIndent()
            )
        }
    }

    override fun getDescription(): String =
        "sites.toggle_status permission and PROFESSOR sites.view + toggle"
}
