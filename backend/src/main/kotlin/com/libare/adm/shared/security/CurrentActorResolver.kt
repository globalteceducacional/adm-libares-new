package com.libare.adm.shared.security

import com.libare.adm.modules.auth.infrastructure.persistence.repository.AdminUserJpaRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class CurrentActorResolver(
    private val adminUserRepository: AdminUserJpaRepository
) {
    fun resolveActorId(): Long? {
        val username = SecurityContextHolder.getContext().authentication?.name?.trim()
        if (username.isNullOrBlank()) {
            return null
        }
        return adminUserRepository.findByUsername(username).map { it.id }.orElse(null)
    }
}
