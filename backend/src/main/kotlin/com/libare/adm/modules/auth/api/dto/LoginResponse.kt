package com.libare.adm.modules.auth.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Resposta de login com JWT e contexto de escolas")
data class LoginResponse(
    @field:Schema(description = "JWT de acesso", example = "eyJhbGciOiJIUzI1NiJ9...")
    val accessToken: String,

    @field:Schema(description = "Validade do token em segundos", example = "28800")
    val expiresInSeconds: Long,

    @field:Schema(description = "Se true, usuario e SUPER da plataforma")
    val isSuperAdmin: Boolean,

    @field:Schema(description = "Escola primaria do usuario, se houver", nullable = true)
    val schoolId: Long?,

    @field:Schema(description = "Codigos de permissao efetivos")
    val permissions: List<String>,

    @field:Schema(description = "Escolas que o usuario pode acessar")
    val allowedSchools: List<AuthSchoolOption>,

    @field:Schema(description = "Se true, o cliente deve enviar X-School-Context")
    val requiresSchoolContext: Boolean,

    @field:Schema(description = "Tipo do token", example = "Bearer")
    val tokenType: String = "Bearer"
)
