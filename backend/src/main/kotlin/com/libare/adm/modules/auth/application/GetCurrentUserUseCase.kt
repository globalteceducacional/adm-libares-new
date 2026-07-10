package com.libare.adm.modules.auth.application

import com.libare.adm.modules.auth.api.dto.AuthMeResponse
import com.libare.adm.modules.auth.api.dto.AuthSchoolOption
import com.libare.adm.modules.rbac.application.ResolveAdminSchoolsUseCase
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.modules.schools.infrastructure.persistence.repository.SchoolJpaRepository
import com.libare.adm.shared.exception.UnauthorizedException
import com.libare.adm.shared.security.AdminPrincipal
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.stereotype.Service

@Service
class GetCurrentUserUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val schoolRepository: SchoolJpaRepository,
    private val resolveAdminSchoolsUseCase: ResolveAdminSchoolsUseCase
) {
    fun execute(): AuthMeResponse {
        val principal = TenantContext.getOrNull()
            ?: throw UnauthorizedException("Sessao invalida ou expirada")

        val admin = panelAdminUserRepository.findById(principal.userId).orElse(null)
        val displayName = admin?.name ?: principal.username

        val allowedSchools = resolveAllowedSchools(principal)
        val effectiveSchoolId = principal.effectiveSchoolId()
        val schoolName = effectiveSchoolId?.let { schoolId ->
            allowedSchools.find { it.id == schoolId }?.name
                ?: schoolRepository.findById(schoolId).orElse(null)?.name
        }

        return AuthMeResponse(
            id = principal.userId,
            username = principal.username,
            name = displayName,
            isSuperAdmin = principal.isSuperAdmin,
            schoolId = effectiveSchoolId,
            schoolName = schoolName,
            permissions = principal.permissions.sorted(),
            permVersion = principal.permVersion,
            allowedSchools = allowedSchools,
            requiresSchoolContext = principal.requiresSchoolContext(),
            effectiveSchoolId = effectiveSchoolId
        )
    }

    fun execute(principal: AdminPrincipal): AuthMeResponse {
        TenantContext.set(principal)
        return try {
            execute()
        } finally {
            TenantContext.clear()
        }
    }

    private fun resolveAllowedSchools(principal: AdminPrincipal): List<AuthSchoolOption> {
        if (principal.isSuperAdmin) {
            return schoolRepository.findAllByOrderByNameAsc().map {
                AuthSchoolOption(id = it.id, name = it.name)
            }
        }

        val schoolIds = resolveAdminSchoolsUseCase.execute(principal.userId, principal.schoolId)
        if (schoolIds.isEmpty()) {
            return emptyList()
        }

        return schoolRepository.findAllById(schoolIds)
            .sortedBy { it.name }
            .map { AuthSchoolOption(id = it.id, name = it.name) }
    }
}
