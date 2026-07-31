package com.libare.adm.modules.rbac.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar ou atualizar um perfil (role) com permissoes")
data class UpsertRoleRequest(
    @field:Schema(description = "Nome do perfil", example = "Editor de conteudo", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Nome e obrigatorio")
    @field:Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
    val name: String,

    @field:Schema(description = "Status: 1 ativo, 0 inativo", example = "1", allowableValues = ["0", "1"], requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String = "1",

    @field:Schema(
        description = "Codigos de permissao atribuidos ao perfil (ex.: books.read, sites.create)",
        example = "[\"books.read\", \"sites.create\"]"
    )
    val permissionCodes: List<String> = emptyList()
)
