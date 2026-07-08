package com.libare.adm.modules.users.api.dto

import jakarta.validation.constraints.Positive

data class UpdateUserAcervoRequest(
    @field:Positive(message = "ID do acervo deve ser maior que zero")
    val acervoId: Long
)
