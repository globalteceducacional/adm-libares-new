package com.libare.adm.modules.site.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class UpsertSiteRequest(
    @field:NotEmpty(message = "Selecione ao menos uma categoria")
    val categoryIds: List<Any>,

    @field:Positive(message = "ID do autor deve ser maior que zero")
    val authorId: Long,

    @field:NotBlank(message = "Titulo e obrigatorio")
    @field:Size(max = 255)
    val title: String,

    @field:NotBlank(message = "Descricao e obrigatoria")
    val description: String,

    val coverImage: String? = null,

    @field:NotBlank(message = "Tipo de arquivo e obrigatorio")
    val fileType: String,

    val fileUrl: String? = null,

    @field:Size(max = 1)
    val featured: String = "0",

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
