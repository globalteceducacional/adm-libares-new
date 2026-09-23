package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

@Schema(
    description = "Cadastro de leitor do aplicativo (tbl_users). " +
        "Acervo/escola sao opcionais e podem ser vinculados depois."
)
data class CreateUserRequest(
    @field:NotBlank @field:Size(max = 150)
    @field:Schema(description = "Nome completo", example = "Maria Silva", requiredMode = Schema.RequiredMode.REQUIRED)
    val name: String,

    @field:NotBlank @field:Email @field:Size(max = 190)
    @field:Schema(description = "Email de login do app", example = "maria@email.com", requiredMode = Schema.RequiredMode.REQUIRED)
    val email: String,

    @field:NotBlank @field:Size(min = 6, max = 100)
    @field:Schema(description = "Senha (minimo 6 caracteres)", example = "Senha@123", requiredMode = Schema.RequiredMode.REQUIRED)
    val password: String,

    @field:NotBlank @field:Size(max = 40)
    @field:Schema(description = "Telefone", example = "98999990000", requiredMode = Schema.RequiredMode.REQUIRED)
    val phone: String,

    @field:Size(max = 255)
    @field:Schema(description = "Nome do arquivo de imagem (opcional)", nullable = true)
    val userImage: String? = null,

    @field:Positive
    @field:Schema(
        description = "Acervo opcional. Se omitido, o usuario fica sem escola/acervo ate o vinculo posterior.",
        example = "2",
        nullable = true,
        requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    val acervoId: Long? = null,

    @field:Size(max = 1)
    @field:Schema(description = "Status: 1=ativo, 0=inativo", example = "1", allowableValues = ["0", "1"])
    val status: String = "1"
)
