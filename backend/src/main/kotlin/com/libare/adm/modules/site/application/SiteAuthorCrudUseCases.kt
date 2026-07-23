package com.libare.adm.modules.site.application

import com.libare.adm.modules.site.api.dto.SiteAuthorResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteAuthorRequest
import com.libare.adm.modules.site.application.policy.SitePolicy
import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteAuthorEntity
import com.libare.adm.modules.site.infrastructure.persistence.repository.SiteAuthorJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListSiteAuthorsUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    fun execute(): List<SiteAuthorResponse> {
        sitePolicy.requireView()
        return repo.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateSiteAuthorUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(request: UpsertSiteAuthorRequest): SiteAuthorResponse {
        sitePolicy.requireCreate()
        val name = request.name.trim()
        if (repo.existsByNameIgnoreCase(name)) {
            throw BadRequestException("Ja existe um autor Site com este nome")
        }
        val saved = repo.save(
            SiteAuthorEntity(
                name = name,
                image = request.image?.trim().orEmpty(),
                // Legacy LONGTEXT NOT NULL — never persist null
                description = request.description?.trim()?.ifBlank { "" } ?: "",
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class UpdateSiteAuthorUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(authorId: Long, request: UpsertSiteAuthorRequest): SiteAuthorResponse {
        sitePolicy.requireUpdate()
        val existing = repo.findById(authorId.toInt())
            .orElseThrow { NotFoundException("Autor Site nao encontrado") }
        val name = request.name.trim()
        if (repo.existsByNameIgnoreCaseAndIdNot(name, authorId.toInt())) {
            throw BadRequestException("Ja existe um autor Site com este nome")
        }
        val saved = repo.save(
            SiteAuthorEntity(
                id = existing.id,
                name = name,
                image = request.image?.trim() ?: existing.image,
                // null = omit/preserve (like image); blank string = clear to ""
                description = when {
                    request.description == null -> existing.description ?: ""
                    else -> request.description.trim().ifBlank { "" }
                },
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class DeleteSiteAuthorUseCase(
    private val repo: SiteAuthorJpaRepository,
    private val sitePolicy: SitePolicy
) {
    @Transactional
    fun execute(authorId: Long) {
        sitePolicy.requireDelete()
        val existing = repo.findById(authorId.toInt())
            .orElseThrow { NotFoundException("Autor Site nao encontrado") }
        repo.save(
            SiteAuthorEntity(
                id = existing.id,
                name = existing.name,
                image = existing.image,
                description = existing.description ?: "",
                status = 0
            )
        )
    }
}

private fun toResponse(e: SiteAuthorEntity) = SiteAuthorResponse(
    id = e.id.toLong(),
    name = e.name,
    image = e.image,
    description = e.description,
    status = e.status.toString()
)
