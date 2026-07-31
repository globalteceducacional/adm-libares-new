package com.libare.adm.modules.site.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar ou atualizar uma secao da home do modulo Site")
data class UpsertSiteSectionRequest(
    @field:Schema(description = "Titulo da secao exibida na home", example = "Lancamentos", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank @field:Size(max = 150)
    val title: String,

    @field:Schema(description = "IDs dos conteudos (sites) vinculados a secao", example = "[1, 5, 12]")
    val siteIds: List<Long> = emptyList(),

    @field:Schema(description = "Status: 1 ativa, 0 inativa", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteSectionResponse(
    val id: Int,
    val title: String,
    val siteIds: List<Long>,
    val siteCount: Int,
    val status: String
)
