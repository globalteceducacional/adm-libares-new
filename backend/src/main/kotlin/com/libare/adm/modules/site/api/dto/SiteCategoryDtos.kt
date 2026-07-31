package com.libare.adm.modules.site.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar ou atualizar uma categoria do modulo Site")
data class UpsertSiteCategoryRequest(
    @field:Schema(description = "Nome da categoria", example = "Literatura Infantil", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank @field:Size(max = 255)
    val name: String,

    @field:Schema(description = "Nome do arquivo de imagem no storage legado", example = "cat7.jpg", nullable = true)
    @field:Size(max = 255)
    val image: String? = null,

    @field:Schema(description = "Status: 1 ativa, 0 inativa", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteCategoryResponse(
    val id: Int,
    val name: String,
    val image: String,
    val status: String
)

data class SiteCategoryImageUploadResponse(val filename: String)
