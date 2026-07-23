package com.libare.adm.modules.site.application.policy

import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class SiteCommentPolicy(
    private val authorizationService: AuthorizationService
) {
    fun requireView() = authorizationService.check("sites.comments.view")
    fun requireModerate() = authorizationService.check("sites.comments.moderate")
}
