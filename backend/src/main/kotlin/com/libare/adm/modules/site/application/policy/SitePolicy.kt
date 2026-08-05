package com.libare.adm.modules.site.application.policy

import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class SitePolicy(
    private val authorizationService: AuthorizationService
) {
    fun requireView() = authorizationService.check("sites.view")
    fun requireCreate() = authorizationService.check("sites.create")
    fun requireUpdate() = authorizationService.check("sites.update")
    fun requireToggleStatus() = authorizationService.check("sites.toggle_status")
    fun requireDelete() = authorizationService.check("sites.delete")
}
