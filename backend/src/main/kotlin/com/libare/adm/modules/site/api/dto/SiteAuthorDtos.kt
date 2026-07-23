package com.libare.adm.modules.site.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertSiteAuthorRequest(
    @field:NotBlank @field:Size(max = 255)
    val name: String,
    @field:Size(max = 255)
    val image: String? = null,
    val description: String? = null,
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteAuthorResponse(
    val id: Long,
    val name: String,
    val image: String,
    val description: String?,
    val status: String
)

data class SiteAuthorImageUploadResponse(val filename: String)
