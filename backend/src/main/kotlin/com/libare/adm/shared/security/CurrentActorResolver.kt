package com.libare.adm.shared.security

import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class CurrentActorResolver(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository
) {
    fun resolveActorId(): Long? {
        val principal = SecurityContextHolder.getContext().authentication?.principal
        if (principal is AdminPrincipal && principal.userId > 0) {
            return principal.userId
        }

        val username = when (principal) {
            is AdminPrincipal -> principal.username
            is String -> principal
            else -> SecurityContextHolder.getContext().authentication?.name
        }?.trim()

        if (username.isNullOrBlank()) {
            return null
        }

        return panelAdminUserRepository.findByUsername(username).map { it.id }.orElse(null)
    }

    fun currentPrincipal(): AdminPrincipal? = TenantContext.getOrNull()
}
