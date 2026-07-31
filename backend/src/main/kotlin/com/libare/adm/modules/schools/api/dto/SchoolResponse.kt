package com.libare.adm.modules.schools.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Escola (tenant) do sistema")
data class SchoolResponse(
    @field:Schema(description = "ID da escola", example = "1")
    val id: Long,

    @field:Schema(description = "Nome da escola", example = "Escola Municipal ABC")
    val name: String,

    @field:Schema(description = "Slug URL-friendly", example = "escola-municipal-abc")
    val slug: String,

    @field:Schema(description = "Status: 1 ativa, 0 inativa", example = "1", allowableValues = ["0", "1"])
    val status: String
)
