package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Pattern

@Schema(description = "Alteracao de status do leitor")
data class UpdateUserStatusRequest(
    @field:Schema(description = "Novo status: 1 ativo, 0 inativo", example = "0", allowableValues = ["0", "1"], requiredMode = Schema.RequiredMode.REQUIRED)
    @field:Pattern(regexp = "^[01]$", message = "Status deve ser 0 ou 1")
    val status: String
)
