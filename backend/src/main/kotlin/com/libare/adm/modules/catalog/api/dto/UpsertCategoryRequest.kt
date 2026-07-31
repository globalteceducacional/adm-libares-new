package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Payload para criar ou atualizar uma categoria")
data class UpsertCategoryRequest(
    @field:Schema(description = "Nome da categoria", example = "Romance", maxLength = 50)
    @field:NotBlank @field:Size(max = 50)
    val name: String,

    @field:Schema(description = "Nome do arquivo da imagem (retornado pelo upload)", nullable = true)
    @field:Size(max = 255)
    val image: String? = null,

    @field:Schema(description = "Status: 1 = ativo, 0 = inativo", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)
