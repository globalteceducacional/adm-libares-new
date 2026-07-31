package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Payload para criar ou atualizar uma secao da pagina inicial")
data class UpsertHomeSectionRequest(
    @field:Schema(description = "Titulo da secao exibido na home", example = "Lancamentos", maxLength = 150)
    @field:NotBlank @field:Size(max = 150)
    val title: String,

    @field:Schema(description = "IDs dos livros vinculados a secao", example = "[1, 2, 3]")
    val bookIds: List<Long> = emptyList(),

    @field:Schema(description = "Status: 1 = ativo, 0 = inativo", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)
