package com.libare.adm.modules.users.application.policy

import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Component

@Component
class UserPolicy(
    private val authorizationService: AuthorizationService
) {
    fun requireCreate() {
        authorizationService.check("users.create")
    }

    fun requireUpdate() {
        authorizationService.check("users.update")
    }

    fun requireDelete() {
        authorizationService.check("users.delete")
    }

    fun requireBlock() {
        authorizationService.check("users.block")
    }

    fun assertCanModify(user: UserEntity) {
        authorizationService.assertSameSchool(user.schoolId)
    }
}
