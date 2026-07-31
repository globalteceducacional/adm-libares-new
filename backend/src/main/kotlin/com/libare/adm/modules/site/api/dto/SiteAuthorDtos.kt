package com.libare.adm.modules.site.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar ou atualizar um autor do modulo Site")
data class UpsertSiteAuthorRequest(
    @field:Schema(description = "Nome do autor", example = "Maria Silva", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank @field:Size(max = 255)
    val name: String,

    @field:Schema(description = "Nome do arquivo de imagem no storage legado", example = "autor42.jpg", nullable = true)
    @field:Size(max = 255)
    val image: String? = null,

    @field:Schema(description = "Biografia ou descricao do autor", nullable = true)
    val description: String? = null,

    @field:Schema(description = "Status: 1 ativo, 0 inativo", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteAuthorResponse(
    val id: Long,
    val name: String,
    val image: String,
    val description: String?,
    val status: String
)

data class SiteAuthorImageUploadResponse(val filename: String)
