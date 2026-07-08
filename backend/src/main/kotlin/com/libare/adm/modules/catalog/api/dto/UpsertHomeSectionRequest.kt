package com.libare.adm.modules.catalog.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertHomeSectionRequest(
    @field:NotBlank @field:Size(max = 150)
    val title: String,
    val bookIds: List<Long> = emptyList(),
    @field:Size(max = 1)
    val status: String = "1"
)
