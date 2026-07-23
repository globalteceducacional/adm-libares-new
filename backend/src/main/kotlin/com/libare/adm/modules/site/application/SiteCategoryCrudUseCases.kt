package com.libare.adm.modules.site.application

import com.libare.adm.modules.site.api.dto.SiteCategoryResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteCategoryRequest
import com.libare.adm.modules.site.application.policy.SitePolicy
import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteCategoryEntity
import com.libare.adm.modules.site.infrastructure.persistence.repository.SiteCategoryJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListSiteCategoriesUseCase(
    private val repo: SiteCategoryJpaRepository,
    private val sitePolicy: SitePolicy
) {
    fun execute(): List<SiteCategoryResponse> {
        sitePolicy.requireView()
        return repo.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateSiteCategoryUseCase(
    private val repo: SiteCategoryJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(request: UpsertSiteCategoryRequest): SiteCategoryResponse {
        sitePolicy.requireCreate()
        val name = request.name.trim()
        if (repo.existsByNameIgnoreCase(name)) {
            throw BadRequestException("Ja existe uma categoria Site com este nome")
        }
        val saved = repo.save(
            SiteCategoryEntity(
                name = name,
                image = request.image?.trim().orEmpty(),
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class UpdateSiteCategoryUseCase(
    private val repo: SiteCategoryJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(categoryId: Int, request: UpsertSiteCategoryRequest): SiteCategoryResponse {
        sitePolicy.requireUpdate()
        val existing = repo.findById(categoryId)
            .orElseThrow { NotFoundException("Categoria Site nao encontrada") }
        val name = request.name.trim()
        if (repo.existsByNameIgnoreCaseAndIdNot(name, categoryId)) {
            throw BadRequestException("Ja existe uma categoria Site com este nome")
        }
        val saved = repo.save(
            SiteCategoryEntity(
                id = existing.id,
                name = name,
                image = request.image?.trim() ?: existing.image,
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class DeleteSiteCategoryUseCase(
    private val repo: SiteCategoryJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(categoryId: Int) {
        sitePolicy.requireDelete()
        val existing = repo.findById(categoryId)
            .orElseThrow { NotFoundException("Categoria Site nao encontrada") }
        repo.save(
            SiteCategoryEntity(
                id = existing.id,
                name = existing.name,
                image = existing.image,
                status = 0
            )
        )
    }
}

private fun toResponse(e: SiteCategoryEntity) = SiteCategoryResponse(
    id = e.id,
    name = e.name,
    image = e.image,
    status = e.status.toString()
)
