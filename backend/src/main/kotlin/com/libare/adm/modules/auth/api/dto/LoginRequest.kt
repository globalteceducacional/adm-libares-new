package com.libare.adm.modules.auth.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank

@Schema(description = "Credenciais de login do painel administrativo")
data class LoginRequest(
    @field:Schema(description = "Nome de usuario administrativo", example = "admin.escola", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "username e obrigatorio")
    val username: String,

    @field:Schema(description = "Senha do usuario", example = "senha123", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "password e obrigatorio")
    val password: String
)
