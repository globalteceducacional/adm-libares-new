package com.libare.adm.modules.catalog.api.dto

import jakarta.validation.constraints.NotBlank

data class ToggleBookStatusRequest(
    @field:NotBlank
    val status: String
)
