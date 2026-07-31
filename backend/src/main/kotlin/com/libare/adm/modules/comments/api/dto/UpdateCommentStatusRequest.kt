package com.libare.adm.modules.comments.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Pattern

@Schema(description = "Alteracao de status de moderacao de comentario")
data class UpdateCommentStatusRequest(
    @field:Schema(description = "Status: 1 aprovado/publicado, 0 rejeitado/oculto", example = "1", allowableValues = ["0", "1"], requiredMode = Schema.RequiredMode.REQUIRED)
    @field:Pattern(regexp = "^[01]$", message = "Status deve ser 0 ou 1")
    val status: String
)
