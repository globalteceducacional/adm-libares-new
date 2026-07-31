package com.libare.adm.modules.rbac.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

@Schema(
    description = "Criacao de membro da equipe do painel (app_admin_users). " +
        "SUPER pode SCHOOL_ADMIN ou PROFESSOR; SCHOOL_ADMIN so PROFESSOR."
)
data class CreateTeamMemberRequest(
    @field:NotBlank @field:Size(max = 100)
    @field:Schema(description = "Username de login no painel", example = "prof.maria", requiredMode = Schema.RequiredMode.REQUIRED)
    val username: String,

    @field:NotBlank @field:Size(min = 6, max = 100)
    @field:Schema(description = "Senha (minimo 6)", example = "Professor@123", requiredMode = Schema.RequiredMode.REQUIRED)
    val password: String,

    @field:NotBlank @field:Size(max = 150)
    @field:Schema(description = "Nome de exibicao", example = "Maria Professora", requiredMode = Schema.RequiredMode.REQUIRED)
    val name: String,

    @field:NotNull
    @field:Schema(description = "Escola a vincular", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    val schoolId: Long,

    @field:NotBlank
    @field:Schema(
        description = "Perfil do sistema na escola",
        example = "PROFESSOR",
        allowableValues = ["SCHOOL_ADMIN", "PROFESSOR"],
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    val roleCode: String
)
