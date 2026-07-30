package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AcervoOptionResponse
import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.application.policy.BookPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import com.libare.adm.shared.util.toAcervoIdLong
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ToggleBookStatusUseCase(
    private val bookRepository: BookJpaRepository,
    private val livroAcervoRepository: LivroAcervoJpaRepository,
    private val acervoRepository: AcervoJpaRepository,
    private val bookPolicy: BookPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(bookId: Long, rawStatus: String): BookResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        bookPolicy.requireToggleStatus()
        bookPolicy.assertBookAccessible(bookId)

        val normalized = rawStatus.trim()
        if (normalized != "0" && normalized != "1") {
            throw BadRequestException("Status invalido. Use 0 (inativo) ou 1 (ativo).")
        }

        val existing = bookRepository.findById(bookId)
            .orElseThrow { NotFoundException("Livro nao encontrado") }

        val updated = bookRepository.save(
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
                status = normalized
            )
        )

        val acervos = livroAcervoRepository.findByBookId(updated.id).mapNotNull { link ->
            val acervo = acervoRepository.findById(link.acervoId).orElse(null) ?: return@mapNotNull null
            AcervoOptionResponse(id = acervo.id.toAcervoIdLong(), name = acervo.nome)
        }

        return updated.toBookResponse(acervos)
    }
}
