package com.libare.adm.modules.site.api.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

@Schema(description = "Dados para criar ou atualizar um conteudo do modulo Site")
data class UpsertSiteRequest(
    @field:Schema(description = "IDs das categorias vinculadas (ao menos uma)", example = "[1, 2]", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotEmpty(message = "Selecione ao menos uma categoria")
    val categoryIds: List<Any>,

    @field:Schema(description = "ID do autor do conteudo", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:Positive(message = "ID do autor deve ser maior que zero")
    val authorId: Long,

    @field:Schema(description = "Titulo do conteudo", example = "Guia de Leitura 2026", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Titulo e obrigatorio")
    @field:Size(max = 255)
    val title: String,

    @field:Schema(description = "Descricao ou sinopse do conteudo", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Descricao e obrigatoria")
    val description: String,

    @field:Schema(description = "Nome do arquivo de capa no storage legado", example = "capa123.jpg", nullable = true)
    val coverImage: String? = null,

    @field:Schema(description = "Tipo de arquivo (ex.: pdf, epub)", example = "pdf", requiredMode = Schema.RequiredMode.REQUIRED)
    @field:NotBlank(message = "Tipo de arquivo e obrigatorio")
    val fileType: String,

    @field:Schema(description = "URL ou caminho do arquivo do conteudo", example = "/uploads/books/livro.pdf", nullable = true)
    val fileUrl: String? = null,

    @field:Schema(description = "Destaque na home: 1 sim, 0 nao", example = "0", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val featured: String = "0",

    @field:Schema(description = "Status: 1 publicado, 0 rascunho/inativo", example = "1", allowableValues = ["0", "1"])
    @field:Size(max = 1)
    val status: String = "1"
)

data class SiteResponse(
    val id: Long,
    val categoryIds: List<Long>,
    val authorId: Long,
    val title: String,
    val description: String,
    val coverImage: String,
    val fileType: String,
    val fileUrl: String,
    val featured: String,
    val status: String,
    val totalRate: Int = 0,
    val rateAvg: String = "0",
    val views: Int = 0
)

data class SiteCoverUploadResponse(val filename: String)

data class SiteFileUploadResponse(
    val filename: String,
    val fileUrl: String
)
