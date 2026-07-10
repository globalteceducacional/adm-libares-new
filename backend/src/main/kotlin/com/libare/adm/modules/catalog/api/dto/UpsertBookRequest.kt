package com.libare.adm.modules.catalog.api.dto



import jakarta.validation.constraints.NotBlank

import jakarta.validation.constraints.NotEmpty

import jakarta.validation.constraints.Positive

import jakarta.validation.constraints.Size



data class UpsertBookRequest(

    @field:NotBlank(message = "Titulo e obrigatorio")

    @field:Size(max = 100, message = "Titulo deve ter no maximo 100 caracteres")

    val title: String,



    @field:Positive(message = "ID do autor deve ser maior que zero")

    val authorId: Long,



    @field:NotBlank(message = "Status e obrigatorio")

    @field:Size(max = 1, message = "Status deve ser 0 ou 1")

    val status: String,



    @field:NotEmpty(message = "Selecione ao menos um acervo")

    val acervoIds: List<Long>,



    @field:NotEmpty(message = "Selecione ao menos uma categoria")

    val categoryIds: List<Long>,



    @field:NotBlank(message = "Descricao e obrigatoria")

    val description: String,



    val bookCoverImage: String? = null,



    @field:NotBlank(message = "Tipo de arquivo e obrigatorio")

    val fileType: String,



    val fileUrl: String? = null,



    val sectionIds: List<Long> = emptyList(),



    val featured: Boolean = false

)

