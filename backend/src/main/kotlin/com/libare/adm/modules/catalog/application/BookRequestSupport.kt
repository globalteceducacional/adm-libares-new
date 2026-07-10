package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.api.dto.UpsertBookRequest
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.util.parseLegacyIdList
import com.libare.adm.shared.util.toLegacyIdCsv

object BookRequestValidator {
    private val allowedFileTypes = setOf("server_url", "local")

    fun validateForCreate(request: UpsertBookRequest) {
        validateCommon(request)
        if (request.bookCoverImage.isNullOrBlank()) {
            throw BadRequestException("A capa do livro e obrigatoria")
        }
        validateFilePayload(request, requireFileUrl = true)
    }

    fun validateForUpdate(request: UpsertBookRequest, existing: BookEntity) {
        validateCommon(request)
        if (request.bookCoverImage.isNullOrBlank() && existing.bookCoverImage.isBlank()) {
            throw BadRequestException("A capa do livro e obrigatoria")
        }
        val requiresFileUrl = request.fileType == "local" && existing.fileUrl.isBlank()
        validateFilePayload(request, requireFileUrl = requiresFileUrl)
    }

    private fun validateCommon(request: UpsertBookRequest) {
        if (request.title.trim().isEmpty()) {
            throw BadRequestException("Titulo e obrigatorio")
        }
        if (request.description.trim().isEmpty()) {
            throw BadRequestException("Descricao e obrigatoria")
        }
        if (request.categoryIds.isEmpty()) {
            throw BadRequestException("Selecione ao menos uma categoria")
        }
    }

    private fun validateFilePayload(request: UpsertBookRequest, requireFileUrl: Boolean) {
        val fileType = request.fileType.trim().lowercase()
        if (fileType !in allowedFileTypes) {
            throw BadRequestException("Tipo de arquivo invalido")
        }
        if (fileType == "server_url" && request.fileUrl.isNullOrBlank()) {
            throw BadRequestException("Informe a URL do arquivo do livro")
        }
        if (requireFileUrl && request.fileUrl.isNullOrBlank()) {
            throw BadRequestException("Envie o arquivo do livro ou informe a URL")
        }
    }
}

fun UpsertBookRequest.toBookEntity(
    existing: BookEntity? = null
): BookEntity {
    val cover = bookCoverImage?.trim().takeUnless { it.isNullOrBlank() }
        ?: existing?.bookCoverImage
        ?: ""
    val resolvedFileUrl = fileUrl?.trim().takeUnless { it.isNullOrBlank() }
        ?: existing?.fileUrl
        ?: ""

    return BookEntity(
        id = existing?.id ?: 0,
        categoryIds = categoryIds.toLegacyIdCsv(),
        sectionIds = sectionIds.takeIf { it.isNotEmpty() }?.toLegacyIdCsv(),
        authorId = authorId,
        featured = if (featured) 1 else 0,
        title = title.trim(),
        description = description.trim(),
        bookCoverImage = cover,
        fileType = fileType.trim().lowercase(),
        fileUrl = resolvedFileUrl,
        totalRate = existing?.totalRate ?: 0,
        rateAvg = existing?.rateAvg ?: "0",
        bookViews = existing?.bookViews ?: 0,
        status = if (status.trim() == "0") "0" else "1"
    )
}

fun BookEntity.toBookResponse(acervos: List<com.libare.adm.modules.catalog.api.dto.AcervoOptionResponse>): BookResponse =
    BookResponse(
        id = id,
        title = title,
        authorId = authorId,
        authorName = null,
        bookCoverImage = bookCoverImage,
        status = status,
        description = description,
        views = bookViews.toLong(),
        featured = featured == 1,
        fileType = fileType,
        fileUrl = fileUrl,
        rateAvg = rateAvg,
        totalRate = totalRate.toLong(),
        categoryId = categoryIds,
        categoryIds = categoryIds.parseLegacyIdList(),
        sectionIds = sectionIds.parseLegacyIdList(),
        acervos = acervos
    )
