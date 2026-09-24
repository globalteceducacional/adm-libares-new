package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Size

@Schema(description = "Adiciona e/ou remove livros de um acervo numa unica operacao (idempotente).")
data class SyncAcervoBooksRequest(
    @field:Schema(description = "IDs de livros a vincular ao acervo", example = "[10, 11]")
    @field:Size(max = 500, message = "Maximo de 500 livros por operacao")
    val add: List<Long> = emptyList(),

    @field:Schema(description = "IDs de livros a desvincular do acervo", example = "[12]")
    @field:Size(max = 500, message = "Maximo de 500 livros por operacao")
    val remove: List<Long> = emptyList()
)
