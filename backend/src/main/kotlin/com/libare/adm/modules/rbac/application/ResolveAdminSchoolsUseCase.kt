package com.libare.adm.modules.rbac.application

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ResolveAdminSchoolsUseCase(
    private val jdbcTemplate: JdbcTemplate
) {
    fun execute(adminUserId: Long, fallbackSchoolId: Long? = null): Set<Long> {
        val fromJunction = jdbcTemplate.queryForList(
            """
            SELECT school_id
            FROM app_admin_user_schools
            WHERE admin_user_id = ?
            ORDER BY school_id ASC
            """.trimIndent(),
            Long::class.java,
            adminUserId
        ).toSet()

        if (fromJunction.isNotEmpty()) {
            return fromJunction
        }
        return fallbackSchoolId?.let { setOf(it) } ?: emptySet()
    }
}
