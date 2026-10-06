package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.api.dto.TeamMemberResponse
import com.libare.adm.modules.rbac.api.dto.UpdateTeamMemberRequest
import com.libare.adm.modules.rbac.application.policy.TeamPolicy
import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PanelAdminUserEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.modules.schools.infrastructure.persistence.repository.SchoolJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateTeamMemberUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val schoolRepository: SchoolJpaRepository,
    private val teamPolicy: TeamPolicy,
    private val passwordEncoder: PasswordEncoder,
    private val jdbcTemplate: JdbcTemplate
) {
    @Transactional
    fun execute(adminUserId: Long, request: UpdateTeamMemberRequest): TeamMemberResponse {
        teamPolicy.requireUpdate()

        val existing = panelAdminUserRepository.findById(adminUserId)
            .orElseThrow { NotFoundException("Membro da equipe nao encontrado") }

        val newPasswordHash = if (!request.newPassword.isNullOrBlank()) {
            passwordEncoder.encode(request.newPassword)
        } else {
            existing.passwordHash
        }

        val bumpPermVersion = !request.newPassword.isNullOrBlank()

        val updated = panelAdminUserRepository.save(
            PanelAdminUserEntity(
                id = existing.id,
                schoolId = existing.schoolId,
                username = existing.username,
                passwordHash = newPasswordHash,
                name = request.name.trim(),
                status = existing.status,
                isSuperAdmin = existing.isSuperAdmin,
                permVersion = if (bumpPermVersion) existing.permVersion + 1 else existing.permVersion,
                uiTheme = existing.uiTheme,
                imageFilename = existing.imageFilename
            )
        )

        val schoolName = existing.schoolId?.let {
            schoolRepository.findById(it).orElse(null)?.name
        }

        val roleCode = jdbcTemplate.queryForList(
            """
            SELECT r.name FROM app_roles r
            INNER JOIN app_admin_user_roles aur ON aur.role_id = r.id
            WHERE aur.admin_user_id = ?
            LIMIT 1
            """.trimIndent(),
            String::class.java,
            adminUserId
        ).firstOrNull() ?: "PROFESSOR"

        return TeamMemberResponse(
            id = updated.id,
            username = updated.username,
            name = updated.name,
            schoolId = updated.schoolId ?: 0L,
            schoolName = schoolName,
            roleCode = roleCode,
            status = updated.status
        )
    }
}
