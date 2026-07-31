package com.libare.adm.modules.rbac.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotEmpty

@Schema(description = "Lista de escolas a vincular a um administrador")
data class AssignAdminSchoolsRequest(
    @field:Schema(description = "IDs das escolas (ao menos uma)", example = "[1, 2]", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotEmpty(message = "Informe ao menos uma escola")
    val schoolIds: List<Long>
)

@Schema(description = "Resultado da vinculacao de escolas ao administrador")
data class AdminSchoolAssignmentResponse(
    @field:Schema(description = "ID do usuario administrativo", example = "10")
    val adminUserId: Long,

    @field:Schema(description = "IDs das escolas vinculadas", example = "[1, 2]")
    val schoolIds: List<Long>
)
