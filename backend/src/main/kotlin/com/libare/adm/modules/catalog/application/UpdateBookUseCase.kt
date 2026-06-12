package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.api.dto.UpsertBookRequest
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateBookUseCase(
    private val bookRepository: BookJpaRepository,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(bookId: Long, request: UpsertBookRequest): BookResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = bookRepository.findByIdAndStatus(bookId, "1")
            ?: throw NotFoundException("Livro nao encontrado")

        val updated = bookRepository.save(
            BookEntity(
                id = existing.id,
                title = request.title.trim(),
                authorId = request.authorId,
                bookCoverImage = existing.bookCoverImage,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )

        return BookResponse(
            id = updated.id,
            title = updated.title,
            authorId = updated.authorId,
            authorName = null,
            bookCoverImage = updated.bookCoverImage,
            status = updated.status
        )
    }
}
