package com.libare.adm.modules.rbac.application.policy

import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class TeamPolicy(
    private val authorizationService: AuthorizationService
) {
    fun requireView() = authorizationService.check("team.view")

    fun requireCreate() = authorizationService.check("team.create")

    fun requireToggleStatus() = authorizationService.check("team.toggle_status")
}
