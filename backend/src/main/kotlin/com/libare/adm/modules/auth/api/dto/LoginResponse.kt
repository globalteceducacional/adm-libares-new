package com.libare.adm.modules.auth.api.dto

data class LoginResponse(
    val accessToken: String,
    val expiresInSeconds: Long,
    val role: String = "ADMIN",
    val tokenType: String = "Bearer"
)
