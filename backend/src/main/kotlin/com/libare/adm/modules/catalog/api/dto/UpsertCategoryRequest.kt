package com.libare.adm.modules.catalog.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertCategoryRequest(
    @field:NotBlank @field:Size(max = 50)
    val name: String,
    @field:Size(max = 255)
    val image: String? = null,
    @field:Size(max = 1)
    val status: String = "1"
)
