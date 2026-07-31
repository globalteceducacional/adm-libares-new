package com.libare.adm.modules.schools.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar ou atualizar uma escola")
data class UpsertSchoolRequest(
    @field:Schema(description = "Nome da escola", example = "Escola Municipal ABC", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    val name: String,

    @field:Schema(description = "Slug URL-friendly (gerado automaticamente se omitido)", example = "escola-municipal-abc", nullable = true)
    @field:Size(max = 80, message = "Slug deve ter no maximo 80 caracteres")
    val slug: String? = null,

    @field:Schema(description = "Status: 1 ativa, 0 inativa", example = "1", allowableValues = ["0", "1"], requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String = "1"
)
