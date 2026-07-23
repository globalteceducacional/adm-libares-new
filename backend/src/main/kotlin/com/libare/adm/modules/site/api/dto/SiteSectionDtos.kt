package com.libare.adm.modules.site.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpsertSiteSectionRequest(
    @field:NotBlank @field:Size(max = 150)
    val title: String,
    val siteIds: List<Long> = emptyList(),
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteSectionResponse(
    val id: Int,
    val title: String,
    val siteIds: List<Long>,
    val siteCount: Int,
    val status: String
)
