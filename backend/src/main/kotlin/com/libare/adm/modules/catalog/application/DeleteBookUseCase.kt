package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.application.policy.BookPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteBookUseCase(
    private val bookRepository: BookJpaRepository,
    private val bookPolicy: BookPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(bookId: Long) {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        bookPolicy.requireDelete()
        bookPolicy.assertBookAccessible(bookId)

        val existing = bookRepository.findById(bookId)
            .orElseThrow { NotFoundException("Livro nao encontrado") }

        bookRepository.save(
            BookEntity(
                id = existing.id,
                categoryIds = existing.categoryIds,
                sectionIds = existing.sectionIds,
                authorId = existing.authorId,
                featured = existing.featured,
                title = existing.title,
                description = existing.description,
                bookCoverImage = existing.bookCoverImage,
                fileType = existing.fileType,
                fileUrl = existing.fileUrl,
                totalRate = existing.totalRate,
                rateAvg = existing.rateAvg,
                bookViews = existing.bookViews,
                status = "0"
            )
        )
    }
}
