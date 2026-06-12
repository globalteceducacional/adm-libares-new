package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.api.dto.UpsertBookRequest
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateBookUseCase(
    private val bookRepository: BookJpaRepository,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(request: UpsertBookRequest): BookResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val created = bookRepository.save(
            BookEntity(
                title = request.title.trim(),
                authorId = request.authorId,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )
        return BookResponse(
            id = created.id,
            title = created.title,
            authorId = created.authorId,
            authorName = null,
            bookCoverImage = created.bookCoverImage,
            status = created.status
        )
    }
}
