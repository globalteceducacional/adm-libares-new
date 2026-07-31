package com.libare.adm.modules.rbac.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Membro da equipe do painel administrativo")
data class TeamMemberResponse(
    @field:Schema(description = "ID do usuario administrativo", example = "10")
    val id: Long,

    @field:Schema(description = "Nome de usuario (login)", example = "professor.silva")
    val username: String,

    @field:Schema(description = "Nome completo", example = "Ana Silva")
    val name: String,

    @field:Schema(description = "ID da escola principal", example = "1")
    val schoolId: Long,

    @field:Schema(description = "Nome da escola principal", example = "Escola Municipal ABC", nullable = true)
    val schoolName: String?,

    @field:Schema(description = "Codigo do perfil", example = "PROFESSOR", allowableValues = ["SUPER", "SCHOOL_ADMIN", "PROFESSOR"])
    val roleCode: String,

    @field:Schema(description = "Status: 1 ativo, 0 inativo", example = "1", allowableValues = ["0", "1"])
    val status: String
)
