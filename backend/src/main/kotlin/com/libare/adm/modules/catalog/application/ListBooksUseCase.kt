package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AcervoOptionResponse
import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.tenant.TenantReadGuard
import com.libare.adm.shared.util.parseLegacyIdList
import com.libare.adm.shared.util.toAcervoIdLong
import org.springframework.stereotype.Service

@Service
class ListBooksUseCase(
    private val bookRepository: BookJpaRepository,
    private val livroAcervoRepository: LivroAcervoJpaRepository,
    private val acervoRepository: AcervoJpaRepository,
    private val tenantReadGuard: TenantReadGuard
) {
    fun execute(acervoId: Long? = null): List<BookResponse> {
        tenantReadGuard.requireViewPermission("books.view")
        if (acervoId != null) {
            tenantReadGuard.assertAcervoAccessible(acervoId)
        }

        val tenantSchoolId = tenantReadGuard.tenantSchoolId()
        val rows = bookRepository.findAllWithAuthorName(tenantSchoolId)

        val filteredRows = if (acervoId != null) {
            val bookIds = livroAcervoRepository.findBookIdsByAcervoId(acervoId).toSet()
            rows.filter { bookIds.contains(it.getId()) }
        } else {
            rows
        }

        val acervosByBook = loadAcervosByBook(filteredRows.map { it.getId() })

        return filteredRows.map { book ->
            BookResponse(
                id = book.getId(),
                title = book.getTitle(),
                authorId = book.getAuthorId(),
                authorName = book.getAuthorName(),
                bookCoverImage = book.getBookCoverImage(),
                status = book.getStatus(),
                description = book.getDescription(),
                views = book.getViews()?.toLong() ?: 0L,
                featured = (book.getFeatured()?.toInt() ?: 0) == 1,
                fileType = book.getFileType(),
                fileUrl = book.getFileUrl(),
                rateAvg = book.getRateAvg(),
                totalRate = book.getTotalRate()?.toLong() ?: 0L,
                categoryId = book.getCategoryId(),
                categoryIds = book.getCategoryId().parseLegacyIdList(),
                sectionIds = book.getSectionIds().parseLegacyIdList(),
                acervos = acervosByBook[book.getId()] ?: emptyList()
            )
        }
    }

    private fun loadAcervosByBook(bookIds: List<Long>): Map<Long, List<AcervoOptionResponse>> {
        if (bookIds.isEmpty()) {
            return emptyMap()
        }

        val links = livroAcervoRepository.findByBookIdIn(bookIds)
        if (links.isEmpty()) {
            return emptyMap()
        }

        val acervoNames = tenantReadGuard.filterAcervosInTenant(
            acervoRepository.findAllById(links.map { it.acervoId }.distinct())
        ).associate { it.id to it.nome }

        return links
            .groupBy { it.bookId }
            .mapValues { (_, bookLinks) ->
                bookLinks.mapNotNull { link ->
                    val name = acervoNames[link.acervoId] ?: return@mapNotNull null
                    AcervoOptionResponse(id = link.acervoId.toAcervoIdLong(), name = name)
                }.sortedBy { it.name.lowercase() }
            }
    }
}
