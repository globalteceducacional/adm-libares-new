package com.libare.adm.modules.site.application

import com.libare.adm.modules.site.api.dto.SiteResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteRequest
import com.libare.adm.modules.site.application.policy.SitePolicy
import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteItemEntity
import com.libare.adm.modules.site.infrastructure.persistence.repository.SiteItemJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.util.parseLegacyIdList
import com.libare.adm.shared.util.toLegacyIdCsv
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val allowedFileTypes = setOf("server_url", "local")

@Service
class ListSitesUseCase(
    private val repo: SiteItemJpaRepository,
    private val sitePolicy: SitePolicy
) {
    fun execute(): List<SiteResponse> {
        sitePolicy.requireView()
        return repo.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateSiteUseCase(
    private val repo: SiteItemJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(request: UpsertSiteRequest): SiteResponse {
        sitePolicy.requireCreate()
        SiteRequestValidator.validateForCreate(request)
        val saved = repo.save(request.toEntity())
        return toResponse(saved)
    }
}

@Service
class UpdateSiteUseCase(
    private val repo: SiteItemJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(siteId: Long, request: UpsertSiteRequest): SiteResponse {
        sitePolicy.requireUpdate()
        val existing = repo.findById(siteId.toInt())
            .orElseThrow { NotFoundException("Site nao encontrado") }
        SiteRequestValidator.validateForUpdate(request, existing)
        val saved = repo.save(request.toEntity(existing))
        return toResponse(saved)
    }
}

@Service
class DeleteSiteUseCase(
    private val repo: SiteItemJpaRepository,
    private val jdbcTemplate: JdbcTemplate,
    private val sitePolicy: SitePolicy
) {
    /**
     * Hard-delete da row em Sites + cascata SOMENTE em tabelas Site.
     * Nunca toca tbl_books / tbl_comments (bug do PHP legado).
     */
    @Transactional
    fun execute(siteId: Long) {
        sitePolicy.requireDelete()
        val id = siteId.toInt()
        if (!repo.existsById(id)) {
            throw NotFoundException("Site nao encontrado")
        }

        // Cascata segura: apenas tabelas do domínio Site
        jdbcTemplate.update("DELETE FROM Comentarios_site WHERE book_id = ?", id)
        jdbcTemplate.update("DELETE FROM rating_sites WHERE book_id = ?", id)
        jdbcTemplate.update("DELETE FROM `vizualização_site` WHERE book_id = ?", id)

        repo.deleteById(id)
    }
}

object SiteRequestValidator {
    fun validateForCreate(request: UpsertSiteRequest) {
        validateCommon(request)
        if (request.coverImage.isNullOrBlank()) {
            throw BadRequestException("A capa do site e obrigatoria")
        }
        validateFilePayload(request, requireFileUrl = true)
    }

    fun validateForUpdate(request: UpsertSiteRequest, existing: SiteItemEntity) {
        validateCommon(request)
        if (request.coverImage.isNullOrBlank() && existing.coverImage.isBlank()) {
            throw BadRequestException("A capa do site e obrigatoria")
        }
        val requiresFileUrl = request.fileType.trim().equals("local", ignoreCase = true) &&
            existing.fileUrl.isBlank()
        validateFilePayload(request, requireFileUrl = requiresFileUrl)
    }

    private fun validateCommon(request: UpsertSiteRequest) {
        if (request.title.trim().isEmpty()) {
            throw BadRequestException("Titulo e obrigatorio")
        }
        if (request.description.trim().isEmpty()) {
            throw BadRequestException("Descricao e obrigatoria")
        }
        if (request.parseCategoryIds().isEmpty()) {
            throw BadRequestException("Selecione ao menos uma categoria")
        }
        if (request.authorId <= 0) {
            throw BadRequestException("ID do autor deve ser maior que zero")
        }
    }

    private fun validateFilePayload(request: UpsertSiteRequest, requireFileUrl: Boolean) {
        val fileType = request.fileType.trim().lowercase()
        if (fileType !in allowedFileTypes) {
            throw BadRequestException("Tipo de arquivo invalido")
        }
        if (fileType == "server_url" && request.fileUrl.isNullOrBlank()) {
            throw BadRequestException("Informe a URL do arquivo do site")
        }
        if (requireFileUrl && request.fileUrl.isNullOrBlank()) {
            throw BadRequestException("Envie o arquivo do site ou informe a URL")
        }
    }
}

fun UpsertSiteRequest.parseCategoryIds(): List<Long> =
    categoryIds.mapNotNull { raw ->
        when (raw) {
            is Number -> raw.toLong()
            else -> raw.toString().trim().takeIf { it.isNotEmpty() }?.toLongOrNull()
        }
    }.distinct()

fun UpsertSiteRequest.toEntity(existing: SiteItemEntity? = null): SiteItemEntity {
    val cover = coverImage?.trim().takeUnless { it.isNullOrBlank() }
        ?: existing?.coverImage
        ?: ""
    val resolvedFileUrl = fileUrl?.trim().takeUnless { it.isNullOrBlank() }
        ?: existing?.fileUrl
        ?: ""

    return SiteItemEntity(
        id = existing?.id ?: 0,
        categoryIds = parseCategoryIds().toLegacyIdCsv(),
        authorId = authorId.toInt(),
        title = title.trim(),
        description = description.trim(),
        coverImage = cover,
        fileType = fileType.trim().lowercase(),
        fileUrl = resolvedFileUrl,
        featured = if (featured.trim() == "1") 1 else 0,
        status = if (status.trim() == "0") 0 else 1,
        totalRate = existing?.totalRate ?: 0,
        rateAvg = existing?.rateAvg ?: "0",
        views = existing?.views ?: 0
    )
}

fun toResponse(e: SiteItemEntity) = SiteResponse(
    id = e.id.toLong(),
    categoryIds = e.categoryIds.parseLegacyIdList(),
    authorId = e.authorId.toLong(),
    title = e.title,
    description = e.description,
    coverImage = e.coverImage,
    fileType = e.fileType,
    fileUrl = e.fileUrl,
    featured = e.featured.toString(),
    status = e.status.toString(),
    totalRate = e.totalRate,
    rateAvg = e.rateAvg,
    views = e.views
)
