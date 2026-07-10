package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.tenant.TenantReadGuard
import org.springframework.stereotype.Service

@Service
class ListUsersUseCase(
    private val userRepository: UserJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val tenantReadGuard: TenantReadGuard
) {
    fun execute(acervoId: Long? = null): List<UserResponse> {
        tenantReadGuard.requireViewPermission("users.view")
        if (acervoId != null) {
            tenantReadGuard.assertAcervoAccessible(acervoId)
        }

        val tenantSchoolId = tenantReadGuard.tenantSchoolId()
        val rows = if (acervoId != null) {
            userRepository.findAllWithAcervoByAcervoId(acervoId, tenantSchoolId)
        } else {
            userRepository.findAllWithAcervo(tenantSchoolId)
        }
        return rows.map(userResponseMapper::fromProjection)
    }
}
