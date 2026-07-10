package com.libare.adm.modules.schools.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateSchoolAdminRequest(
    @field:NotBlank(message = "Usuario e obrigatorio")
    @field:Size(max = 100, message = "Usuario deve ter no maximo 100 caracteres")
    val username: String,

    @field:NotBlank(message = "Senha e obrigatoria")
    @field:Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
    val password: String,

    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    val name: String
)

data class SchoolAdminResponse(
    val id: Long,
    val username: String,
    val name: String,
    val schoolId: Long,
    val status: String
)
