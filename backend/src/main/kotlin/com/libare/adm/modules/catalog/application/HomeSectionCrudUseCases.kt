package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.HomeSectionResponse
import com.libare.adm.modules.catalog.api.dto.UpsertHomeSectionRequest
import com.libare.adm.modules.catalog.application.policy.BookPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.HomeSectionEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.HomeSectionJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.tenant.TenantSqlGuard
import com.libare.adm.shared.util.parseLegacyIdList
import com.libare.adm.shared.util.toLegacyIdCsv
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListHomeSectionsUseCase(
    private val homeSectionRepository: HomeSectionJpaRepository,
    private val authorizationService: AuthorizationService
) {
    fun execute(): List<HomeSectionResponse> {
        authorizationService.check("books.view")
        return homeSectionRepository.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateHomeSectionUseCase(
    private val homeSectionRepository: HomeSectionJpaRepository,
    private val bookRepository: BookJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(request: UpsertHomeSectionRequest): HomeSectionResponse {
        bookPolicy.requireCreate()
        val title = request.title.trim()
        if (homeSectionRepository.existsByTitleIgnoreCase(title)) {
            throw BadRequestException("Ja existe uma secao com este titulo")
        }

        val bookIds = normalizeBookIds(request.bookIds)
        validateBookAccess(bookIds, bookRepository, bookPolicy)

        val saved = homeSectionRepository.save(
            HomeSectionEntity(
                title = title,
                sectionBooks = bookIds.toLegacyIdCsv(),
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        syncSectionIdsOnBooks(
            sectionId = saved.id.toLong(),
            previousBookIds = emptyList(),
            nextBookIds = bookIds,
            bookRepository = bookRepository
        )
        return toResponse(saved)
    }
}

@Service
class UpdateHomeSectionUseCase(
    private val homeSectionRepository: HomeSectionJpaRepository,
    private val bookRepository: BookJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(sectionId: Int, request: UpsertHomeSectionRequest): HomeSectionResponse {
        bookPolicy.requireUpdate()
        val existing = homeSectionRepository.findById(sectionId)
            .orElseThrow { NotFoundException("Secao nao encontrada") }

        val title = request.title.trim()
        if (homeSectionRepository.existsByTitleIgnoreCaseAndIdNot(title, sectionId)) {
            throw BadRequestException("Ja existe uma secao com este titulo")
        }

        val bookIds = normalizeBookIds(request.bookIds)
        validateBookAccess(bookIds, bookRepository, bookPolicy)
        val previousBookIds = existing.sectionBooks.parseLegacyIdList()

        val saved = homeSectionRepository.save(
            HomeSectionEntity(
                id = existing.id,
                title = title,
                sectionBooks = bookIds.toLegacyIdCsv(),
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        syncSectionIdsOnBooks(
            sectionId = saved.id.toLong(),
            previousBookIds = previousBookIds,
            nextBookIds = bookIds,
            bookRepository = bookRepository
        )
        return toResponse(saved)
    }
}

@Service
class DeleteHomeSectionUseCase(
    private val homeSectionRepository: HomeSectionJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(sectionId: Int) {
        bookPolicy.requireDelete()
        val existing = homeSectionRepository.findById(sectionId)
            .orElseThrow { NotFoundException("Secao nao encontrada") }
        homeSectionRepository.save(
            HomeSectionEntity(
                id = existing.id,
                title = existing.title,
                sectionBooks = existing.sectionBooks,
                status = 0
            )
        )
    }
}

private fun normalizeBookIds(bookIds: List<Long>): List<Long> =
    bookIds.distinct().sorted()

private fun validateBookAccess(
    bookIds: List<Long>,
    bookRepository: BookJpaRepository,
    bookPolicy: BookPolicy
) {
    if (bookIds.isEmpty()) {
        return
    }
    val found = bookRepository.findAllById(bookIds)
    val foundIds = found.map { it.id }.toSet()
    val missing = bookIds.filterNot { it in foundIds }
    if (missing.isNotEmpty()) {
        throw BadRequestException("Livro(s) nao encontrado(s): ${missing.joinToString(",")}")
    }
    if (TenantSqlGuard.tenantSchoolIdParam() != null) {
        bookIds.forEach { bookPolicy.assertBookAccessible(it) }
    }
}

private fun syncSectionIdsOnBooks(
    sectionId: Long,
    previousBookIds: List<Long>,
    nextBookIds: List<Long>,
    bookRepository: BookJpaRepository
) {
    val previous = previousBookIds.toSet()
    val next = nextBookIds.toSet()
    val toAdd = next - previous
    val toRemove = previous - next
    val affectedIds = (toAdd + toRemove).toList()
    if (affectedIds.isEmpty()) {
        return
    }

    val books = bookRepository.findAllById(affectedIds)
    books.forEach { book ->
        val current = book.sectionIds.parseLegacyIdList().toMutableList()
        when {
            book.id in toAdd && sectionId !in current -> current += sectionId
            book.id in toRemove -> current.removeAll { it == sectionId }
        }
        val nextCsv = current.toLegacyIdCsv().ifBlank { null }
        if (nextCsv != book.sectionIds) {
            bookRepository.save(book.copyWithSectionIds(nextCsv))
        }
    }
}

private fun BookEntity.copyWithSectionIds(sectionIds: String?): BookEntity =
    BookEntity(
        id = id,
        categoryIds = categoryIds,
        sectionIds = sectionIds,
        authorId = authorId,
        featured = featured,
        title = title,
        description = description,
        bookCoverImage = bookCoverImage,
        fileType = fileType,
        fileUrl = fileUrl,
        totalRate = totalRate,
        rateAvg = rateAvg,
        bookViews = bookViews,
        status = status
    )

private fun toResponse(row: HomeSectionEntity): HomeSectionResponse {
    val bookIds = row.sectionBooks.parseLegacyIdList()
    return HomeSectionResponse(
        id = row.id,
        title = row.title,
        bookIds = bookIds,
        bookCount = bookIds.size,
        status = row.status.toString()
    )
}
