package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.api.dto.AdminSchoolAssignmentResponse
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.modules.schools.infrastructure.persistence.repository.SchoolJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AssignAdminSchoolsUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val schoolRepository: SchoolJpaRepository,
    private val authorizationService: AuthorizationService,
    private val jdbcTemplate: JdbcTemplate
) {
    @Transactional
    fun execute(adminUserId: Long, schoolIds: List<Long>): AdminSchoolAssignmentResponse {
        authorizationService.check("schools.update")

        val admin = panelAdminUserRepository.findById(adminUserId)
            .orElseThrow { NotFoundException("Administrador nao encontrado") }

        if (admin.isSuperAdmin) {
            throw BadRequestException("Super admin nao possui escolas vinculadas")
        }

        val distinctIds = schoolIds.distinct()
        if (distinctIds.isEmpty()) {
            throw BadRequestException("Informe ao menos uma escola")
        }

        distinctIds.forEach { schoolId ->
            if (!schoolRepository.existsById(schoolId)) {
                throw NotFoundException("Escola $schoolId nao encontrada")
            }
        }

        jdbcTemplate.update("DELETE FROM app_admin_user_schools WHERE admin_user_id = ?", adminUserId)
        distinctIds.forEach { schoolId ->
            jdbcTemplate.update(
                "INSERT INTO app_admin_user_schools (admin_user_id, school_id) VALUES (?, ?)",
                adminUserId,
                schoolId
            )
        }

        val primarySchoolId = distinctIds.min()
        jdbcTemplate.update(
            """
            UPDATE app_admin_users
            SET school_id = ?, perm_version = perm_version + 1
            WHERE id = ?
            """.trimIndent(),
            primarySchoolId,
            adminUserId
        )

        return AdminSchoolAssignmentResponse(
            adminUserId = adminUserId,
            schoolIds = distinctIds.sorted()
        )
    }
}
