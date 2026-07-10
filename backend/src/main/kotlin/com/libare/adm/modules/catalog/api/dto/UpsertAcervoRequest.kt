package com.libare.adm.modules.catalog.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertAcervoRequest(
    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
    val name: String,

    val description: String? = null,

    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String = "1"
)
