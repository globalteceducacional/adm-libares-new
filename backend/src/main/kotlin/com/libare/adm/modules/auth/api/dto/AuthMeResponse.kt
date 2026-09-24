package com.libare.adm.modules.auth.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Contrato disponivel para o admin autenticado")
data class AuthSchoolOption(
    @field:Schema(description = "ID do contrato", example = "1")
    val id: Long,

    @field:Schema(description = "Nome do contrato", example = "Contrato Demo")
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

    @field:Schema(description = "Contrato primario", nullable = true)
    val schoolId: Long?,

    @field:Schema(description = "Nome do contrato primario", nullable = true)
    val schoolName: String?,

    @field:Schema(description = "Permissoes efetivas")
    val permissions: List<String>,

    @field:Schema(description = "Versao de permissoes (cache/invalidacao)")
    val permVersion: Int,

    @field:Schema(description = "Contratos acessiveis")
    val allowedSchools: List<AuthSchoolOption>,

    @field:Schema(description = "Se true, exige header X-School-Context")
    val requiresSchoolContext: Boolean,

    @field:Schema(description = "Contrato efetivo da requisicao atual", nullable = true)
    val effectiveSchoolId: Long?,

    @field:Schema(description = "Tema persistido (light/dark)", nullable = true)
    val uiTheme: String? = null,

    @field:Schema(description = "URL publica do avatar", nullable = true)
    val imageUrl: String? = null
)
