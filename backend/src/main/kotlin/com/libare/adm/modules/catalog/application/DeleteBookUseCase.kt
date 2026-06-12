package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteBookUseCase(
    private val bookRepository: BookJpaRepository,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(bookId: Long) {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = bookRepository.findByIdAndStatus(bookId, "1")
            ?: throw NotFoundException("Livro nao encontrado")

        bookRepository.save(
            BookEntity(
                id = existing.id,
                title = existing.title,
                authorId = existing.authorId,
                bookCoverImage = existing.bookCoverImage,
                status = "0"
            )
        )
    }
}
