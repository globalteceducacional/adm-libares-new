package com.libare.adm.modules.auth.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Escola disponivel para o admin autenticado")
data class AuthSchoolOption(
    @field:Schema(description = "ID da escola", example = "1")
    val id: Long,

    @field:Schema(description = "Nome da escola", example = "Escola Demo")
    val name: String
)

@Schema(description = "Perfil da sessao autenticada no painel")
data class AuthMeResponse(
    @field:Schema(description = "ID do admin", example = "1")
    val id: Long,

    @field:Schema(description = "Username", example = "teste.admin")
    val username: String,

    @field:Schema(description = "Nome de exibicao")
    val name: String,

    @field:Schema(description = "Se true, SUPER da plataforma")
    val isSuperAdmin: Boolean,

    @field:Schema(description = "Escola primaria", nullable = true)
    val schoolId: Long?,

    @field:Schema(description = "Nome da escola primaria", nullable = true)
    val schoolName: String?,

    @field:Schema(description = "Permissoes efetivas")
    val permissions: List<String>,

    @field:Schema(description = "Versao de permissoes (cache/invalidacao)")
    val permVersion: Int,

    @field:Schema(description = "Escolas acessiveis")
    val allowedSchools: List<AuthSchoolOption>,

    @field:Schema(description = "Se true, exige header X-School-Context")
    val requiresSchoolContext: Boolean,

    @field:Schema(description = "Escola efetiva da requisicao atual", nullable = true)
    val effectiveSchoolId: Long?
)
