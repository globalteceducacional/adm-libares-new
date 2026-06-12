package com.libare.adm.modules.users.api.dto

import jakarta.validation.constraints.Pattern

data class UpdateUserStatusRequest(
    @field:Pattern(regexp = "^[01]$", message = "Status deve ser 0 ou 1")
    val status: String
)
