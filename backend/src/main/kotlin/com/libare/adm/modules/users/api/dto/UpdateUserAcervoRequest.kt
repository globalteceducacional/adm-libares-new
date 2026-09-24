package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Positive

@Schema(description = "Alteracao do acervo vinculado ao leitor. Envie null para desvincular.")
data class UpdateUserAcervoRequest(
    @field:Schema(
        description = "ID do novo acervo (contrato acessivel pelo ator). null = desvincular",
        example = "5",
        nullable = true
    )
    @field:Positive(message = "ID do acervo deve ser maior que zero")
    val acervoId: Long? = null
)
