package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import org.springframework.stereotype.Service

@Service
class ResolveAdminPermissionsUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository
) {
    fun execute(adminUserId: Long): Set<String> =
        panelAdminUserRepository.findPermissionCodesByAdminUserId(adminUserId).toSet()
}
