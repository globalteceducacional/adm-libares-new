package com.libare.adm.modules.auth.api.dto

import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    @field:NotBlank(message = "username e obrigatorio")
    val username: String,
    @field:NotBlank(message = "password e obrigatorio")
    val password: String
)
