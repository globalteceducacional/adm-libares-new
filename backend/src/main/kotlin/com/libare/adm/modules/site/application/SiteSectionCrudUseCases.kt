package com.libare.adm.modules.site.application

import com.libare.adm.modules.site.api.dto.SiteSectionResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteSectionRequest
import com.libare.adm.modules.site.application.policy.SitePolicy
import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteSectionEntity
import com.libare.adm.modules.site.infrastructure.persistence.repository.SiteSectionJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.util.parseLegacyIdList
import com.libare.adm.shared.util.toLegacyIdCsv
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListSiteSectionsUseCase(
    private val repo: SiteSectionJpaRepository,
    private val sitePolicy: SitePolicy
) {
    fun execute(): List<SiteSectionResponse> {
        sitePolicy.requireView()
        return repo.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateSiteSectionUseCase(
    private val repo: SiteSectionJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(request: UpsertSiteSectionRequest): SiteSectionResponse {
        sitePolicy.requireCreate()
        val title = request.title.trim()
        if (repo.existsByTitleIgnoreCase(title)) {
            throw BadRequestException("Ja existe uma secao Site com este titulo")
        }
        val siteIds = request.siteIds.distinct().sorted()
        val saved = repo.save(
            SiteSectionEntity(
                title = title,
                siteIdsCsv = siteIds.toLegacyIdCsv(),
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class UpdateSiteSectionUseCase(
    private val repo: SiteSectionJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(sectionId: Int, request: UpsertSiteSectionRequest): SiteSectionResponse {
        sitePolicy.requireUpdate()
        val existing = repo.findById(sectionId)
            .orElseThrow { NotFoundException("Secao Site nao encontrada") }
        val title = request.title.trim()
        if (repo.existsByTitleIgnoreCaseAndIdNot(title, sectionId)) {
            throw BadRequestException("Ja existe uma secao Site com este titulo")
        }
        val siteIds = request.siteIds.distinct().sorted()
        val saved = repo.save(
            SiteSectionEntity(
                id = existing.id,
                title = title,
                siteIdsCsv = siteIds.toLegacyIdCsv(),
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class DeleteSiteSectionUseCase(
    private val repo: SiteSectionJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(sectionId: Int) {
        sitePolicy.requireDelete()
        val existing = repo.findById(sectionId)
            .orElseThrow { NotFoundException("Secao Site nao encontrada") }
        repo.save(
            SiteSectionEntity(
                id = existing.id,
                title = existing.title,
                siteIdsCsv = existing.siteIdsCsv,
                status = 0
            )
        )
    }
}

private fun toResponse(e: SiteSectionEntity): SiteSectionResponse {
    val siteIds = e.siteIdsCsv.parseLegacyIdList()
    return SiteSectionResponse(
        id = e.id,
        title = e.title,
        siteIds = siteIds,
        siteCount = siteIds.size,
        status = e.status.toString()
    )
}
