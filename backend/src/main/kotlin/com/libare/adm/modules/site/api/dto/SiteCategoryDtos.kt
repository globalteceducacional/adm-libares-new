package com.libare.adm.modules.site.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertSiteCategoryRequest(
    @field:NotBlank @field:Size(max = 255)
    val name: String,
    @field:Size(max = 255)
    val image: String? = null,
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteCategoryResponse(
    val id: Int,
    val name: String,
    val image: String,
    val status: String
)

data class SiteCategoryImageUploadResponse(val filename: String)
