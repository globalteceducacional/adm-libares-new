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
            "sites.view", "sites.create", "sites.update", "sites.delete",
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
}
