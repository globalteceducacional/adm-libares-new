package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Payload para criar ou atualizar um acervo da escola")
data class UpsertAcervoRequest(
    @field:Schema(description = "Nome do acervo", example = "Acervo Principal", maxLength = 100)
    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
    val name: String,

    @field:Schema(description = "Descricao do acervo", nullable = true)
    val description: String? = null,

    @field:Schema(description = "Status: 1 = ativo, 0 = inativo", example = "1", allowableValues = ["0", "1"])
    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String = "1"
)
