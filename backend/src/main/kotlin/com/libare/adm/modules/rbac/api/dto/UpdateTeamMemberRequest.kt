package com.libare.adm.modules.rbac.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Edicao de nome e senha de um membro da equipe do painel")
data class UpdateTeamMemberRequest(
    @field:NotBlank @field:Size(max = 150)
    @field:Schema(description = "Nome de exibicao", example = "Maria Professora")
    val name: String,

    @field:Size(min = 6, max = 100)
    @field:Schema(description = "Nova senha (minimo 6 caracteres; omitir para manter a atual)", nullable = true)
    val newPassword: String? = null
)
