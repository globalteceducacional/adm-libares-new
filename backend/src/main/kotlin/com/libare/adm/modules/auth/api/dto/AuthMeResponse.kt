package com.libare.adm.modules.auth.api.dto

data class AuthSchoolOption(
    val id: Long,
    val name: String
)

data class AuthMeResponse(
    val id: Long,
    val username: String,
    val name: String,
    val isSuperAdmin: Boolean,
    val schoolId: Long?,
    val schoolName: String?,
    val permissions: List<String>,
    val permVersion: Int,
    val allowedSchools: List<AuthSchoolOption>,
    val requiresSchoolContext: Boolean,
    val effectiveSchoolId: Long?
)
