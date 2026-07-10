package com.libare.adm.modules.auth.api.dto

data class LoginResponse(
    val accessToken: String,
    val expiresInSeconds: Long,
    val isSuperAdmin: Boolean,
    val schoolId: Long?,
    val permissions: List<String>,
    val allowedSchools: List<AuthSchoolOption>,
    val requiresSchoolContext: Boolean,
    val tokenType: String = "Bearer"
)
