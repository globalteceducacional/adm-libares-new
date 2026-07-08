package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AuthorResponse
import com.libare.adm.modules.catalog.api.dto.UpsertAuthorRequest
import com.libare.adm.modules.catalog.application.policy.BookPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AuthorEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AuthorJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListAuthorsUseCase(
    private val authorRepository: AuthorJpaRepository,
    private val authorizationService: AuthorizationService
) {
    fun execute(): List<AuthorResponse> {
        authorizationService.check("books.view")
        return authorRepository.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateAuthorUseCase(
    private val authorRepository: AuthorJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(request: UpsertAuthorRequest): AuthorResponse {
        bookPolicy.requireCreate()
        val name = request.name.trim()
        if (authorRepository.existsByNameIgnoreCase(name)) {
            throw BadRequestException("Ja existe um autor com este nome")
        }
        val saved = authorRepository.save(
            AuthorEntity(
                name = name,
                image = request.image?.trim().orEmpty(),
                // Legacy LONGTEXT NOT NULL — never persist null
                description = request.description?.trim()?.ifBlank { "" } ?: "",
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )
        return toResponse(saved)
    }
}

@Service
class UpdateAuthorUseCase(
    private val authorRepository: AuthorJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(authorId: Long, request: UpsertAuthorRequest): AuthorResponse {
        bookPolicy.requireUpdate()
        val existing = authorRepository.findById(authorId)
            .orElseThrow { NotFoundException("Autor nao encontrado") }
        val name = request.name.trim()
        if (authorRepository.existsByNameIgnoreCaseAndIdNot(name, authorId)) {
            throw BadRequestException("Ja existe um autor com este nome")
        }
        val saved = authorRepository.save(
            AuthorEntity(
                id = existing.id,
                name = name,
                image = request.image?.trim() ?: existing.image,
                // null = omit/preserve (like image); blank string = clear to ""
                description = when {
                    request.description == null -> existing.description ?: ""
                    else -> request.description.trim().ifBlank { "" }
                },
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )
        return toResponse(saved)
    }
}

@Service
class DeleteAuthorUseCase(
    private val authorRepository: AuthorJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(authorId: Long) {
        bookPolicy.requireDelete()
        val existing = authorRepository.findById(authorId)
            .orElseThrow { NotFoundException("Autor nao encontrado") }
        authorRepository.save(
            AuthorEntity(
                id = existing.id,
                name = existing.name,
                image = existing.image,
                description = existing.description ?: "",
                status = "0"
            )
        )
    }
}

private fun toResponse(row: AuthorEntity) = AuthorResponse(
    id = row.id,
    name = row.name,
    image = row.image.ifBlank { null },
    description = row.description?.ifBlank { null },
    status = row.status
)
