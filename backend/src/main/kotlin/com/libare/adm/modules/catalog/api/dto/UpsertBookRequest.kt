package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

@Schema(description = "Payload para criar ou atualizar um livro")
data class UpsertBookRequest(
    @field:Schema(description = "Titulo do livro", example = "Dom Casmurro", maxLength = 100)
    @field:NotBlank(message = "Titulo e obrigatorio")
    @field:Size(max = 100, message = "Titulo deve ter no maximo 100 caracteres")
    val title: String,

    @field:Schema(description = "ID do autor vinculado", example = "1")
    @field:Positive(message = "ID do autor deve ser maior que zero")
    val authorId: Long,

    @field:Schema(description = "Status ativo (1) ou inativo (0)", example = "1", allowableValues = ["0", "1"])
    @field:NotBlank(message = "Status e obrigatorio")
    @field:Size(max = 1, message = "Status deve ser 0 ou 1")
    val status: String,

    @field:Schema(description = "IDs dos acervos onde o livro sera publicado", example = "[1]")
    @field:NotEmpty(message = "Selecione ao menos um acervo")
    val acervoIds: List<Long>,

    @field:Schema(description = "IDs das categorias do livro", example = "[2, 5]")
    @field:NotEmpty(message = "Selecione ao menos uma categoria")
    val categoryIds: List<Long>,

    @field:Schema(description = "Descricao ou sinopse do livro")
    @field:NotBlank(message = "Descricao e obrigatoria")
    val description: String,

    @field:Schema(description = "Nome do arquivo da capa (retornado pelo upload de capa)", nullable = true)
    val bookCoverImage: String? = null,

    @field:Schema(description = "Tipo do arquivo do livro (ex.: pdf, epub)", example = "pdf")
    @field:NotBlank(message = "Tipo de arquivo e obrigatorio")
    val fileType: String,

    @field:Schema(description = "URL ou caminho do arquivo (retornado pelo upload de arquivo)", nullable = true)
    val fileUrl: String? = null,

    @field:Schema(description = "IDs das secoes da home onde o livro aparece", example = "[]")
    val sectionIds: List<Long> = emptyList(),

    @field:Schema(description = "Indica se o livro e destaque na home", example = "false")
    val featured: Boolean = false
)
