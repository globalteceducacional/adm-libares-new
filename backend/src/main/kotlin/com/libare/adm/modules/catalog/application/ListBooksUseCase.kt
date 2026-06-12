package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.BookJpaRepository
import org.springframework.stereotype.Service

@Service
class ListBooksUseCase(
    private val bookRepository: BookJpaRepository
) {

    fun execute(): List<BookResponse> =
        bookRepository.findAllWithAuthorName()
            .map { book ->
                BookResponse(
                    id = book.getId(),
                    title = book.getTitle(),
                    authorId = book.getAuthorId(),
                    authorName = book.getAuthorName(),
                    bookCoverImage = book.getBookCoverImage(),
                    status = book.getStatus()
                )
            }
}
