package com.libare.adm.modules.catalog.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class UpsertBookRequest(
    @field:NotBlank(message = "Titulo e obrigatorio")
    @field:Size(max = 255, message = "Titulo deve ter no maximo 255 caracteres")
    val title: String,

    @field:Positive(message = "ID do autor deve ser maior que zero")
    val authorId: Long,

    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String
)
