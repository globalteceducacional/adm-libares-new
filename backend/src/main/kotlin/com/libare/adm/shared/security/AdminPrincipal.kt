package com.libare.adm.shared.security

data class AdminPrincipal(
    val userId: Long,
    val username: String,
    val schoolId: Long?,
    val isSuperAdmin: Boolean,
    val permissions: Set<String>,
    val permVersion: Int,
    val allowedSchoolIds: Set<Long> = emptySet(),
    val activeSchoolId: Long? = null
) {
    fun resolvedAllowedSchoolIds(): Set<Long> =
        when {
            isSuperAdmin -> emptySet()
            allowedSchoolIds.isNotEmpty() -> allowedSchoolIds
            schoolId != null -> setOf(schoolId)
            else -> emptySet()
        }

    fun effectiveSchoolId(): Long? =
        when {
            isSuperAdmin -> activeSchoolId
            resolvedAllowedSchoolIds().size == 1 -> resolvedAllowedSchoolIds().first()
            activeSchoolId != null -> activeSchoolId
            else -> schoolId
        }

    fun requiresSchoolContext(): Boolean =
        when {
            isSuperAdmin -> hasPermission("platform.impersonate")
            else -> resolvedAllowedSchoolIds().size > 1
        }

    fun hasPermission(code: String): Boolean =
        isSuperAdmin || code in permissions

    fun canAccessSchool(schoolId: Long): Boolean =
        isSuperAdmin || schoolId in resolvedAllowedSchoolIds()
}
