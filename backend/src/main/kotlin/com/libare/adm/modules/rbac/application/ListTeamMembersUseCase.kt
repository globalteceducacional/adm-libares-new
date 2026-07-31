package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.api.dto.TeamMemberResponse
import com.libare.adm.modules.rbac.application.policy.TeamPolicy
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ListTeamMembersUseCase(
    private val teamPolicy: TeamPolicy,
    private val jdbcTemplate: JdbcTemplate
) {
    fun execute(): List<TeamMemberResponse> {
        teamPolicy.requireView()

        val principal = TenantContext.get()
        val params = mutableListOf<Any>()
        val filters = mutableListOf("u.is_super_admin = 0")

        if (!principal.isSuperAdmin) {
            val allowedSchoolIds = principal.resolvedAllowedSchoolIds()
            if (allowedSchoolIds.isEmpty()) {
                return emptyList()
            }
            filters += "us.school_id IN (${allowedSchoolIds.joinToString(",") { "?" }})"
            params.addAll(allowedSchoolIds)
        } else if (principal.activeSchoolId != null) {
            filters += "us.school_id = ?"
            params.add(principal.activeSchoolId)
        }

        val sql = """
            SELECT
                u.id,
                u.username,
                u.name,
                us.school_id,
                s.name AS school_name,
                COALESCE(
                    (
                        SELECT r2.name
                        FROM app_admin_user_roles ur2
                        INNER JOIN app_roles r2 ON r2.id = ur2.role_id
                        WHERE ur2.admin_user_id = u.id
                          AND r2.school_id = us.school_id
                          AND r2.name IN ('SCHOOL_ADMIN', 'PROFESSOR')
                        ORDER BY CASE r2.name
                            WHEN 'SCHOOL_ADMIN' THEN 1
                            WHEN 'PROFESSOR' THEN 2
                            ELSE 3
                        END
                        LIMIT 1
                    ),
                    'UNKNOWN'
                ) AS role_code,
                u.status
            FROM app_admin_users u
            INNER JOIN app_admin_user_schools us ON us.admin_user_id = u.id
            INNER JOIN app_schools s ON s.id = us.school_id
            WHERE ${filters.joinToString(" AND ")}
            ORDER BY u.name, s.name
        """.trimIndent()

        return jdbcTemplate.query(sql, { rs, _ ->
            TeamMemberResponse(
                id = rs.getLong("id"),
                username = rs.getString("username"),
                name = rs.getString("name"),
                schoolId = rs.getLong("school_id"),
                schoolName = rs.getString("school_name"),
                roleCode = rs.getString("role_code"),
                status = rs.getString("status")
            )
        }, *params.toTypedArray())
    }
}
