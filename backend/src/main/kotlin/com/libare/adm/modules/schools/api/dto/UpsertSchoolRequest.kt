package com.libare.adm.modules.schools.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertSchoolRequest(
    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    val name: String,

    @field:Size(max = 80, message = "Slug deve ter no maximo 80 caracteres")
    val slug: String? = null,

    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String = "1"
)
