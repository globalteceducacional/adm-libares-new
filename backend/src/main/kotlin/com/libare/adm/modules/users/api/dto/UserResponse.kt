package com.libare.adm.modules.users.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Leitor do aplicativo (tbl_users)")
data class UserResponse(
    @field:Schema(description = "ID do leitor", example = "42")
    val id: Long,

    @field:Schema(description = "Nome completo", example = "Joao Santos")
    val name: String,

    @field:Schema(description = "E-mail de login", example = "joao@email.com")
    val email: String,

    @field:Schema(description = "Telefone de contato", example = "11999998888", nullable = true)
    val phone: String?,

    @field:Schema(description = "Tipo de usuario no app", example = "reader")
    val userType: String,

    @field:Schema(description = "URL ou caminho da foto de perfil", nullable = true)
    val userImage: String?,

    @field:Schema(description = "Status: 1 ativo, 0 inativo", example = "1", allowableValues = ["0", "1"])
    val status: String,

    @field:Schema(description = "ID do acervo vinculado", example = "5", nullable = true)
    val acervoId: Long? = null,

    @field:Schema(description = "Nome do acervo vinculado", example = "Acervo Principal", nullable = true)
    val acervoName: String? = null
)
