package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AcervoResponse
import com.libare.adm.modules.catalog.api.dto.SyncAcervoBooksRequest
import com.libare.adm.modules.catalog.application.policy.AcervoPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.LivroAcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Vincula/desvincula livros de um acervo a partir do hub do acervo.
 * Invariante mantida: todo livro precisa ter ao menos um acervo (mesma regra de [SyncBookAcervosUseCase]).
 */
@Service
class SyncAcervoBooksUseCase(
    private val acervoPolicy: AcervoPolicy,
    private val bookRepository: BookJpaRepository,
    private val livroAcervoRepository: LivroAcervoJpaRepository,
    private val getAcervoUseCase: GetAcervoUseCase,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(acervoId: Long, request: SyncAcervoBooksRequest): AcervoResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val acervo = acervoPolicy.loadForUpdate(acervoId)
        if (!acervo.status) {
            throw BadRequestException("Acervo inativo nao pode receber livros")
        }

        val toAdd = request.add.filter { it > 0 }.distinct()
        val toRemove = request.remove.filter { it > 0 }.distinct()
        val overlap = toAdd.intersect(toRemove.toSet())
        if (overlap.isNotEmpty()) {
            throw BadRequestException("Um livro nao pode estar em add e remove ao mesmo tempo")
        }

        val requestedIds = toAdd + toRemove
        if (requestedIds.isNotEmpty()) {
            val found = bookRepository.findAllById(requestedIds).map { it.id }.toSet()
            val missing = requestedIds.filterNot { it in found }
            if (missing.isNotEmpty()) {
                throw BadRequestException("Livro(s) inexistente(s): ${missing.joinToString(", ")}")
            }
        }

        val currentLinks = livroAcervoRepository.findByAcervoId(acervo.id)
        val currentBookIds = currentLinks.map { it.bookId }.toSet()

        if (toRemove.isNotEmpty()) {
            assertBooksKeepAnAcervo(toRemove.filter { it in currentBookIds }, acervo.id)
            livroAcervoRepository.deleteByAcervoIdAndBookIdIn(acervo.id, toRemove)
            livroAcervoRepository.flush()
        }

        toAdd.filterNot { it in currentBookIds }.forEach { bookId ->
            livroAcervoRepository.save(LivroAcervoEntity(bookId = bookId, acervoId = acervo.id))
        }

        return getAcervoUseCase.execute(acervoId)
    }

    /** Recusa remover livros cujo unico acervo e este (ficariam invisiveis para todos os leitores). */
    private fun assertBooksKeepAnAcervo(bookIds: List<Long>, acervoId: Int) {
        if (bookIds.isEmpty()) return
        val otherLinks = livroAcervoRepository.findByBookIdIn(bookIds)
            .filter { it.acervoId != acervoId }
            .groupBy { it.bookId }
        val orphans = bookIds.filter { otherLinks[it].isNullOrEmpty() }
        if (orphans.isNotEmpty()) {
            val titles = bookRepository.findAllById(orphans).map { it.title }
            throw BadRequestException(
                "Estes livros ficariam sem acervo; vincule-os a outro antes de remover: ${titles.joinToString(", ")}"
            )
        }
    }
}
