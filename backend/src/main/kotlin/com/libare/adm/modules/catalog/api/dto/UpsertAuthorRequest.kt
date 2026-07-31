package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Payload para criar ou atualizar um autor")
data class UpsertAuthorRequest(
    @field:Schema(description = "Nome do autor", example = "Machado de Assis", maxLength = 255)
    @field:NotBlank @field:Size(max = 255)
    val name: String,

    @field:Schema(description = "Nome do arquivo da foto (retornado pelo upload)", nullable = true)
    @field:Size(max = 255)
    val image: String? = null,

    @field:Schema(description = "Biografia ou descricao do autor", nullable = true)
    val description: String? = null,

    @field:Schema(description = "Status: 1 = ativo, 0 = inativo", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)
