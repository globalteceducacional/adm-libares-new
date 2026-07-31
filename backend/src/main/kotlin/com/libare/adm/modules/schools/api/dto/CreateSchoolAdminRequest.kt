package com.libare.adm.modules.schools.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar administrador (SCHOOL_ADMIN) de uma escola")
data class CreateSchoolAdminRequest(
    @field:Schema(description = "Nome de usuario (login)", example = "admin.escola", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Usuario e obrigatorio")
    @field:Size(max = 100, message = "Usuario deve ter no maximo 100 caracteres")
    val username: String,

    @field:Schema(description = "Senha inicial", example = "senha123", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Senha e obrigatoria")
    @field:Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
    val password: String,

    @field:Schema(description = "Nome completo", example = "Maria Silva", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    val name: String
)

@Schema(description = "Administrador de escola criado")
data class SchoolAdminResponse(
    @field:Schema(description = "ID do usuario administrativo", example = "10")
    val id: Long,

    @field:Schema(description = "Nome de usuario (login)", example = "admin.escola")
    val username: String,

    @field:Schema(description = "Nome completo", example = "Maria Silva")
    val name: String,

    @field:Schema(description = "ID da escola", example = "1")
    val schoolId: Long,

    @field:Schema(description = "Status: 1 ativo, 0 inativo", example = "1", allowableValues = ["0", "1"])
    val status: String
)
