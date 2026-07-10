package com.libare.adm.shared.security

import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.stereotype.Service

@Service
class AuthorizationService {
    fun can(permission: String): Boolean {
        val principal = TenantContext.getOrNull() ?: return false
        return principal.hasPermission(permission)
    }

    fun check(permission: String) {
        if (!can(permission)) {
            throw ForbiddenException("Permissao negada: $permission")
        }
    }

    fun assertSameSchool(targetSchoolId: Long?) {
        val principal = TenantContext.get()
        if (principal.isSuperAdmin && principal.activeSchoolId == null) {
            return
        }
        val effective = principal.effectiveSchoolId()
        if (effective == null || targetSchoolId == null || effective != targetSchoolId) {
            throw ForbiddenException("Acesso negado a recurso de outra escola")
        }
    }
}
