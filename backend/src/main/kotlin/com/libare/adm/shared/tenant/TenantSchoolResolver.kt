package com.libare.adm.shared.tenant

import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.security.AdminPrincipal
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

@Component
class TenantSchoolResolver {
    fun resolveActiveSchoolId(request: HttpServletRequest, principal: AdminPrincipal): Long? {
        val raw = request.getHeader(HEADER_SCHOOL_CONTEXT)?.trim().orEmpty()
        val requested = raw.takeIf { it.isNotEmpty() }?.toLongOrNull()

        if (principal.isSuperAdmin) {
            if (!principal.hasPermission("platform.impersonate")) {
                return null
            }
            return requested
        }

        val allowed = principal.resolvedAllowedSchoolIds()
        if (allowed.size == 1) {
            return allowed.first()
        }

        if (requested == null) {
            return null
        }

        if (requested !in allowed) {
            throw ForbiddenException("Escola nao autorizada para este usuario")
        }

        return requested
    }

    companion object {
        const val HEADER_SCHOOL_CONTEXT = "X-School-Context"
    }
}
