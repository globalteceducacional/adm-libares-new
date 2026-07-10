package com.libare.adm.modules.schools.application.policy

import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class SchoolPolicy(
    private val authorizationService: AuthorizationService
) {
    fun requireView() {
        authorizationService.check("schools.view")
    }

    fun requireCreate() {
        authorizationService.check("schools.create")
    }

    fun requireUpdate() {
        authorizationService.check("schools.update")
    }

    fun requireDelete() {
        authorizationService.check("schools.delete")
    }
}
