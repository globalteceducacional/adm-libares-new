package com.libare.adm.modules.rbac.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank

@Schema(description = "Payload para ativar ou desativar um membro da equipe")
data class ToggleTeamMemberStatusRequest(
    @field:Schema(description = "Novo status: 1 = ativo, 0 = inativo", example = "0", allowableValues = ["0", "1"])
    @field:NotBlank
    val status: String
)
