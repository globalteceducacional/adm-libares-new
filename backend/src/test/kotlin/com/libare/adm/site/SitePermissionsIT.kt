package com.libare.adm.site

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate

@SpringBootTest
class SitePermissionsIT {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Test
    fun `sites permissions exist and are granted to SUPER_ADMIN`() {
        val codes = listOf(
            "sites.view", "sites.create", "sites.update", "sites.delete", "sites.toggle_status",
            "sites.comments.view", "sites.comments.moderate"
        )
        codes.forEach { code ->
            val n = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app_permissions WHERE code = ?",
                Int::class.java,
                code
            )!!
            assertTrue(n >= 1, "Falta permissao $code")
        }
        val superHas = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM app_role_permissions rp
            INNER JOIN app_roles r ON r.id = rp.role_id
            INNER JOIN app_permissions p ON p.id = rp.permission_id
            WHERE r.name = 'SUPER_ADMIN' AND r.school_id IS NULL AND p.code = 'sites.view'
            """.trimIndent(),
            Int::class.java
        )!!
        assertTrue(superHas >= 1)
    }

    @Test
    fun `SCHOOL_ADMIN roles do not get sites_view by default`() {
        val n = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM app_role_permissions rp
            INNER JOIN app_roles r ON r.id = rp.role_id
            INNER JOIN app_permissions p ON p.id = rp.permission_id
            WHERE r.name = 'SCHOOL_ADMIN' AND r.school_id IS NOT NULL AND p.code = 'sites.view'
            """.trimIndent(),
            Int::class.java
        )!!
        assertFalse(n > 0, "SCHOOL_ADMIN nao deve receber sites.* por padrao")
    }

    @Test
    fun `PROFESSOR roles get sites_view and sites_toggle_status when role exists`() {
        val professorCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM app_roles WHERE name = 'PROFESSOR' AND school_id IS NOT NULL",
            Int::class.java
        )!!
        if (professorCount == 0) {
            return
        }
        val missing = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM app_roles r
            WHERE r.name = 'PROFESSOR' AND r.school_id IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM app_role_permissions rp
                INNER JOIN app_permissions p ON p.id = rp.permission_id
                WHERE rp.role_id = r.id AND p.code = 'sites.view'
              )
            """.trimIndent(),
            Int::class.java
        )!!
        assertTrue(missing == 0, "Todo PROFESSOR deve ter sites.view apos V20")
        val missingToggle = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM app_roles r
            WHERE r.name = 'PROFESSOR' AND r.school_id IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM app_role_permissions rp
                INNER JOIN app_permissions p ON p.id = rp.permission_id
                WHERE rp.role_id = r.id AND p.code = 'sites.toggle_status'
              )
            """.trimIndent(),
            Int::class.java
        )!!
        assertTrue(missingToggle == 0, "Todo PROFESSOR deve ter sites.toggle_status apos V20")
    }
}
