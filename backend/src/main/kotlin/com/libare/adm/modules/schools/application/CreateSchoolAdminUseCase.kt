package com.libare.adm.modules.schools.application

import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PanelAdminUserEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.RoleJpaRepository
import com.libare.adm.modules.schools.api.dto.CreateSchoolAdminRequest
import com.libare.adm.modules.schools.api.dto.SchoolAdminResponse
import com.libare.adm.modules.schools.application.policy.SchoolPolicy
import com.libare.adm.modules.schools.infrastructure.persistence.repository.SchoolJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateSchoolAdminUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val roleRepository: RoleJpaRepository,
    private val schoolPolicy: SchoolPolicy,
    private val passwordEncoder: PasswordEncoder,
    private val jdbcTemplate: JdbcTemplate
) {
    @Transactional
    fun execute(schoolId: Long, request: CreateSchoolAdminRequest): SchoolAdminResponse {
        schoolPolicy.requireUpdate()

        schoolRepository.findById(schoolId)
            .orElseThrow { NotFoundException("Escola nao encontrada") }

        val username = request.username.trim()
        if (panelAdminUserRepository.existsByUsernameIgnoreCase(username)) {
            throw BadRequestException("Usuario ja existe")
        }

        val saved = panelAdminUserRepository.save(
            PanelAdminUserEntity(
                schoolId = schoolId,
                username = username,
                passwordHash = passwordEncoder.encode(request.password),
                name = request.name.trim(),
                status = "1",
                isSuperAdmin = false
            )
        )

        val schoolAdminRole = roleRepository.findBySchoolIdAndName(schoolId, "SCHOOL_ADMIN")
            ?: throw BadRequestException("Perfil SCHOOL_ADMIN nao encontrado para a escola")

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
            VALUES (?, ?)
            """.trimIndent(),
            saved.id,
            schoolAdminRole.id
        )

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_admin_user_schools (admin_user_id, school_id)
            VALUES (?, ?)
            """.trimIndent(),
            saved.id,
            schoolId
        )

        return SchoolAdminResponse(
            id = saved.id,
            username = saved.username,
            name = saved.name,
            schoolId = schoolId,
            status = saved.status
        )
    }
}
