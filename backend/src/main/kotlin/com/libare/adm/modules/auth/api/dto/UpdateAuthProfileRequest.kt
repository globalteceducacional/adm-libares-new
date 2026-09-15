package com.libare.adm.modules.auth.api.dto

import jakarta.validation.constraints.Size

data class UpdateAuthProfileRequest(
    @field:Size(max = 150)
    val name: String? = null,
    @field:Size(max = 16)
    val uiTheme: String? = null
)
