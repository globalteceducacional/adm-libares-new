package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AcervoOptionResponse
import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.api.dto.UpsertBookRequest
import com.libare.adm.modules.catalog.application.policy.BookPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import com.libare.adm.shared.util.toAcervoIdLong
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateBookUseCase(
    private val bookRepository: BookJpaRepository,
    private val syncBookAcervosUseCase: SyncBookAcervosUseCase,
    private val livroAcervoRepository: LivroAcervoJpaRepository,
    private val acervoRepository: AcervoJpaRepository,
    private val bookPolicy: BookPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(request: UpsertBookRequest): BookResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        bookPolicy.requireCreate()
        BookRequestValidator.validateForCreate(request)

        val created = bookRepository.save(request.toBookEntity())
        syncBookAcervosUseCase.execute(created.id, request.acervoIds)

        return toResponse(created)
    }

    private fun toResponse(book: com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity): BookResponse {
        val acervos = livroAcervoRepository.findByBookId(book.id).mapNotNull { link ->
            val acervo = acervoRepository.findById(link.acervoId).orElse(null) ?: return@mapNotNull null
            AcervoOptionResponse(id = acervo.id.toAcervoIdLong(), name = acervo.nome)
        }

        return book.toBookResponse(acervos)
    }
}
