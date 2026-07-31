package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Positive

@Schema(description = "Alteracao do acervo vinculado ao leitor")
data class UpdateUserAcervoRequest(
    @field:Schema(description = "ID do novo acervo (da mesma escola)", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:Positive(message = "ID do acervo deve ser maior que zero")
    val acervoId: Long
)
