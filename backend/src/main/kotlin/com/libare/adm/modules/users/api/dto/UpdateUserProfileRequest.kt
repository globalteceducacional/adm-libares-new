package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Atualizacao de perfil do leitor (nome, email, telefone)")
data class UpdateUserProfileRequest(
    @field:NotBlank @field:Size(max = 150)
    @field:Schema(description = "Nome completo", example = "Maria Silva", requiredMode = Schema.RequiredMode.REQUIRED)
    val name: String,

    @field:NotBlank @field:Email @field:Size(max = 190)
    @field:Schema(description = "Email de login", example = "maria@email.com", requiredMode = Schema.RequiredMode.REQUIRED)
    val email: String,

    @field:NotBlank @field:Size(max = 40)
    @field:Schema(description = "Telefone", example = "98999990000", requiredMode = Schema.RequiredMode.REQUIRED)
    val phone: String
)
