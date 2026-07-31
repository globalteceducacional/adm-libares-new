package com.libare.adm.modules.catalog.api.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Representacao de um livro no catalogo")
data class BookResponse(
    @field:Schema(description = "ID do livro", example = "42")
    val id: Long,

    @field:Schema(description = "Titulo do livro")
    val title: String,

    @field:Schema(description = "ID do autor")
    val authorId: Long,

    @field:Schema(description = "Nome do autor", nullable = true)
    val authorName: String?,

    @field:Schema(description = "Nome do arquivo da capa", nullable = true)
    val bookCoverImage: String?,

    @field:Schema(description = "Status: 1 = ativo, 0 = inativo", example = "1")
    val status: String,

    @field:Schema(description = "Descricao do livro", nullable = true)
    val description: String? = null,

    @field:Schema(description = "Total de visualizacoes")
    val views: Long = 0,

    @field:Schema(description = "Livro em destaque na home")
    val featured: Boolean = false,

    @field:Schema(description = "Tipo do arquivo (pdf, epub, etc.)", nullable = true)
    val fileType: String? = null,

    @field:Schema(description = "URL ou caminho do arquivo", nullable = true)
    val fileUrl: String? = null,

    @field:Schema(description = "Media de avaliacoes", nullable = true)
    val rateAvg: String? = null,

    @field:Schema(description = "Total de avaliacoes")
    val totalRate: Long = 0,

    @field:Schema(description = "IDs de categorias em formato legado (string)", nullable = true)
    val categoryId: String? = null,

    @field:Schema(description = "IDs das categorias vinculadas")
    val categoryIds: List<Long> = emptyList(),

    @field:Schema(description = "IDs das secoes da home vinculadas")
    val sectionIds: List<Long> = emptyList(),

    @field:Schema(description = "Acervos onde o livro esta publicado")
    val acervos: List<AcervoOptionResponse> = emptyList()
)
