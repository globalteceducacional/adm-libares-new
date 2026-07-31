package com.libare.adm.modules.rbac.application

object TeamCreateAuthorization {
    const val ROLE_SCHOOL_ADMIN = "SCHOOL_ADMIN"
    const val ROLE_PROFESSOR = "PROFESSOR"

    fun allowedRoleCodes(isSuperAdmin: Boolean): Set<String> =
        if (isSuperAdmin) setOf(ROLE_SCHOOL_ADMIN, ROLE_PROFESSOR)
        else setOf(ROLE_PROFESSOR)

    fun assertCanCreate(isSuperAdmin: Boolean, roleCode: String) {
        val normalized = roleCode.trim().uppercase()
        if (normalized !in allowedRoleCodes(isSuperAdmin)) {
            throw com.libare.adm.shared.exception.ForbiddenException(
                "Perfil nao permitido para o seu usuario"
            )
        }
    }

    fun assertCanAssignSchool(
        isSuperAdmin: Boolean,
        targetSchoolId: Long,
        callerAllowedSchoolIds: Set<Long>
    ) {
        if (isSuperAdmin) return
        if (targetSchoolId !in callerAllowedSchoolIds) {
            throw com.libare.adm.shared.exception.ForbiddenException(
                "Escola nao permitida"
            )
        }
    }
}
