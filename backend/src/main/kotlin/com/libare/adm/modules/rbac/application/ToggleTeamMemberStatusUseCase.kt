package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.api.dto.TeamMemberResponse
import com.libare.adm.modules.rbac.application.policy.TeamPolicy
import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PanelAdminUserEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ToggleTeamMemberStatusUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val teamPolicy: TeamPolicy,
    private val jdbcTemplate: JdbcTemplate
) {
    @Transactional
    fun execute(adminUserId: Long, rawStatus: String): TeamMemberResponse {
        teamPolicy.requireToggleStatus()

        val normalized = rawStatus.trim()
        if (normalized != "0" && normalized != "1") {
            throw BadRequestException("Status invalido. Use 0 (inativo) ou 1 (ativo).")
        }

        val principal = TenantContext.get()
        if (principal.userId == adminUserId) {
            throw BadRequestException("Nao e permitido alterar o status do proprio usuario.")
        }

        val existing = panelAdminUserRepository.findById(adminUserId)
            .orElseThrow { NotFoundException("Membro da equipe nao encontrado") }

        if (existing.isSuperAdmin) {
            throw ForbiddenException("Nao e permitido alterar status de Super Admin.")
        }

        assertCanManageMember(principal.isSuperAdmin, principal.resolvedAllowedSchoolIds(), adminUserId)

        val saved = panelAdminUserRepository.save(
            PanelAdminUserEntity(
                id = existing.id,
                schoolId = existing.schoolId,
                username = existing.username,
                passwordHash = existing.passwordHash,
                name = existing.name,
                status = normalized,
                isSuperAdmin = existing.isSuperAdmin,
                permVersion = existing.permVersion
            )
        )

        return toTeamMemberResponse(saved)
    }

    private fun assertCanManageMember(
        isSuperAdmin: Boolean,
        allowedSchoolIds: Collection<Long>,
        adminUserId: Long
    ) {
        if (isSuperAdmin) {
            return
        }
        if (allowedSchoolIds.isEmpty()) {
            throw ForbiddenException("Sem escola no contexto para gerenciar equipe.")
        }
        val placeholders = allowedSchoolIds.joinToString(",") { "?" }
        val params = mutableListOf<Any>(adminUserId)
        params.addAll(allowedSchoolIds)
        val count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM app_admin_user_schools
            WHERE admin_user_id = ?
              AND school_id IN ($placeholders)
            """.trimIndent(),
            Int::class.java,
            *params.toTypedArray()
        ) ?: 0
        if (count < 1) {
            throw ForbiddenException("Membro fora do escopo de escolas permitidas.")
        }
    }

    private fun toTeamMemberResponse(user: PanelAdminUserEntity): TeamMemberResponse {
        val row = jdbcTemplate.query(
            """
            SELECT
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
                ) AS role_code
            FROM app_admin_users u
            INNER JOIN app_admin_user_schools us ON us.admin_user_id = u.id
            INNER JOIN app_schools s ON s.id = us.school_id
            WHERE u.id = ?
            ORDER BY us.school_id
            LIMIT 1
            """.trimIndent(),
            { rs, _ ->
                Triple(
                    rs.getLong("school_id"),
                    rs.getString("school_name"),
                    rs.getString("role_code")
                )
            },
            user.id
        ).firstOrNull()

        return TeamMemberResponse(
            id = user.id,
            username = user.username,
            name = user.name,
            schoolId = row?.first ?: (user.schoolId ?: 0L),
            schoolName = row?.second,
            roleCode = row?.third ?: "UNKNOWN",
            status = user.status
        )
    }
}
