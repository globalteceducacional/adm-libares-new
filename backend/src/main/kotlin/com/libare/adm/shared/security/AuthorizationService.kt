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

    /**
     * Recurso **com** contrato: o ator precisa estar nesse contrato (ou ser super admin global).
     * `targetSchoolId == null` e negado — use [assertSameSchoolOrUnassigned] quando
     * "sem contrato" significar "nao reivindicado" (ADR 0006).
     */
    fun assertSameSchool(targetSchoolId: Long?) {
        val principal = TenantContext.get()
        if (principal.isSuperAdmin && principal.activeSchoolId == null) {
            return
        }
        val effective = principal.effectiveSchoolId()
        if (effective == null || targetSchoolId == null || effective != targetSchoolId) {
            throw ForbiddenException("Acesso negado a recurso de outro contrato")
        }
    }

    /**
     * Recurso sem contrato (`null`) e "nao reivindicado": qualquer ator que ja passou na
     * checagem de permissao pode agir. Com contrato, cai em [assertSameSchool].
     */
    fun assertSameSchoolOrUnassigned(targetSchoolId: Long?) {
        if (targetSchoolId == null) {
            return
        }
        assertSameSchool(targetSchoolId)
    }
}
