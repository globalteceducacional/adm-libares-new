package db.migration

import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

/**
 * Role PROFESSOR (escopo escola), permissao books.toggle_status,
 * seed Escola Professor Teste + acervo + teste.professor.
 */
class V18__ProfessorRoleAndSeed : BaseJavaMigration() {
    override fun migrate(context: Context) {
        val connection = context.connection
        val encoder = BCryptPasswordEncoder()
        val professorHash = encoder.encode("Professor@123")

        connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO app_permissions (code, module, description)
                SELECT 'books.toggle_status', 'books', 'Ativar/desativar livros'
                FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM app_permissions WHERE code = 'books.toggle_status'
                )
                """.trimIndent()
            )

            // PROFESSOR em cada escola existente
            st.execute(
                """
                INSERT INTO app_roles (school_id, name, is_system, status)
                SELECT s.id, 'PROFESSOR', 1, '1'
                FROM app_schools s
                WHERE NOT EXISTS (
                    SELECT 1 FROM app_roles r
                    WHERE r.school_id = s.id AND r.name = 'PROFESSOR'
                )
                """.trimIndent()
            )

            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code IN ('books.view', 'books.toggle_status')
                WHERE r.name = 'PROFESSOR' AND r.school_id IS NOT NULL
                """.trimIndent()
            )

            // Admins ja existentes tambem podem toggle (SCHOOL_ADMIN / SUPER_ADMIN)
            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_permissions p ON p.code = 'books.toggle_status'
                WHERE r.name IN ('SCHOOL_ADMIN', 'SUPER_ADMIN')
                """.trimIndent()
            )

            // Escola + acervo de teste
            st.execute(
                """
                INSERT INTO app_schools (name, slug, status)
                SELECT 'Escola Professor Teste', 'escola-professor-teste', '1'
                FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM app_schools WHERE slug = 'escola-professor-teste'
                )
                """.trimIndent()
            )
        }

        // Garante role PROFESSOR na escola nova (caso insert acima tenha criado escola agora)
        connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO app_roles (school_id, name, is_system, status)
                SELECT s.id, 'PROFESSOR', 1, '1'
                FROM app_schools s
                WHERE s.slug = 'escola-professor-teste'
                  AND NOT EXISTS (
                    SELECT 1 FROM app_roles r
                    WHERE r.school_id = s.id AND r.name = 'PROFESSOR'
                  )
                """.trimIndent()
            )
            st.execute(
                """
                INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
                SELECT r.id, p.id
                FROM app_roles r
                INNER JOIN app_schools s ON s.id = r.school_id AND s.slug = 'escola-professor-teste'
                INNER JOIN app_permissions p ON p.code IN ('books.view', 'books.toggle_status')
                WHERE r.name = 'PROFESSOR'
                """.trimIndent()
            )
            // SCHOOL_ADMIN tambem na escola teste (padrao de provisionamento)
            st.execute(
                """
                INSERT INTO app_roles (school_id, name, is_system, status)
                SELECT s.id, 'SCHOOL_ADMIN', 1, '1'
                FROM app_schools s
                WHERE s.slug = 'escola-professor-teste'
                  AND NOT EXISTS (
                    SELECT 1 FROM app_roles r
                    WHERE r.school_id = s.id AND r.name = 'SCHOOL_ADMIN'
                  )
                """.trimIndent()
            )
        }

        // Acervo da escola (coluna school_id pode existir)
        connection.createStatement().use { st ->
            st.execute(
                """
                INSERT INTO acervos (nome, descricao, status, school_id)
                SELECT
                    'Acervo do Professor Teste',
                    'Acervo exclusivo da escola de teste do professor',
                    1,
                    s.id
                FROM app_schools s
                WHERE s.slug = 'escola-professor-teste'
                  AND NOT EXISTS (
                    SELECT 1 FROM acervos a
                    WHERE a.nome = 'Acervo do Professor Teste' AND a.school_id = s.id
                  )
                """.trimIndent()
            )

            // Vincula ate 20 livros do acervo 1 (se existir) ao acervo do professor
            st.execute(
                """
                INSERT INTO livros_acervos (book_id, acervo_id)
                SELECT src.book_id, dest.id
                FROM (
                    SELECT la.book_id
                    FROM livros_acervos la
                    WHERE la.acervo_id = 1
                    LIMIT 20
                ) src
                INNER JOIN acervos dest ON dest.nome = 'Acervo do Professor Teste'
                INNER JOIN app_schools s ON s.id = dest.school_id AND s.slug = 'escola-professor-teste'
                WHERE NOT EXISTS (
                    SELECT 1 FROM livros_acervos x
                    WHERE x.book_id = src.book_id AND x.acervo_id = dest.id
                )
                """.trimIndent()
            )
        }

        connection.prepareStatement(
            """
            INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
            SELECT s.id, 'teste.professor', ?, 'Professor Teste', '1', 0
            FROM app_schools s
            WHERE s.slug = 'escola-professor-teste'
              AND NOT EXISTS (
                SELECT 1 FROM app_admin_users WHERE username = 'teste.professor'
              )
            """.trimIndent()
        ).use { ps ->
            ps.setString(1, professorHash)
            ps.executeUpdate()
        }

        connection.createStatement().use { st ->
            st.execute(
                """
                INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
                SELECT u.id, r.id
                FROM app_admin_users u
                INNER JOIN app_schools s ON s.slug = 'escola-professor-teste'
                INNER JOIN app_roles r ON r.school_id = s.id AND r.name = 'PROFESSOR'
                WHERE u.username = 'teste.professor'
                """.trimIndent()
            )
            st.execute(
                """
                INSERT IGNORE INTO app_admin_user_schools (admin_user_id, school_id)
                SELECT u.id, s.id
                FROM app_admin_users u
                INNER JOIN app_schools s ON s.slug = 'escola-professor-teste'
                WHERE u.username = 'teste.professor'
                """.trimIndent()
            )
            // Alinha school_id do usuario
            st.execute(
                """
                UPDATE app_admin_users u
                INNER JOIN app_schools s ON s.slug = 'escola-professor-teste'
                SET u.school_id = s.id
                WHERE u.username = 'teste.professor'
                """.trimIndent()
            )
        }
    }

    override fun getDescription(): String =
        "Professor role, books.toggle_status, and teste.professor seed"
}
