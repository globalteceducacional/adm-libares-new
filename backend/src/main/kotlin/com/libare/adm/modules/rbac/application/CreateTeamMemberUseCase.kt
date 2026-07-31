package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.api.dto.CreateTeamMemberRequest
import com.libare.adm.modules.rbac.api.dto.TeamMemberResponse
import com.libare.adm.modules.rbac.application.policy.TeamPolicy
import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PanelAdminUserEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.RoleJpaRepository
import com.libare.adm.modules.schools.infrastructure.persistence.repository.SchoolJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateTeamMemberUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val roleRepository: RoleJpaRepository,
    private val teamPolicy: TeamPolicy,
    private val passwordEncoder: PasswordEncoder,
    private val jdbcTemplate: JdbcTemplate
) {
    @Transactional
    fun execute(request: CreateTeamMemberRequest): TeamMemberResponse {
        teamPolicy.requireCreate()

        val principal = TenantContext.get()
        val roleCode = request.roleCode.trim().uppercase()
        TeamCreateAuthorization.assertCanCreate(principal.isSuperAdmin, roleCode)
        TeamCreateAuthorization.assertCanAssignSchool(
            principal.isSuperAdmin,
            request.schoolId,
            principal.resolvedAllowedSchoolIds()
        )

        val school = schoolRepository.findById(request.schoolId)
            .orElseThrow { NotFoundException("Escola nao encontrada") }

        val username = request.username.trim()
        if (panelAdminUserRepository.existsByUsernameIgnoreCase(username)) {
            throw BadRequestException("Usuario ja existe")
        }

        val role = roleRepository.findBySchoolIdAndName(request.schoolId, roleCode)
            ?: throw BadRequestException("Perfil $roleCode nao encontrado para a escola")

        val saved = panelAdminUserRepository.save(
            PanelAdminUserEntity(
                schoolId = request.schoolId,
                username = username,
                passwordHash = passwordEncoder.encode(request.password),
                name = request.name.trim(),
                status = "1",
                isSuperAdmin = false
            )
        )

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
            VALUES (?, ?)
            """.trimIndent(),
            saved.id,
            role.id
        )

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_admin_user_schools (admin_user_id, school_id)
            VALUES (?, ?)
            """.trimIndent(),
            saved.id,
            request.schoolId
        )

        return TeamMemberResponse(
            id = saved.id,
            username = saved.username,
            name = saved.name,
            schoolId = request.schoolId,
            schoolName = school.name,
            roleCode = roleCode,
            status = saved.status
        )
    }
}
