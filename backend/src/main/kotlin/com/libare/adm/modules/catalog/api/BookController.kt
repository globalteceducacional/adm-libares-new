package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.api.dto.AuthorOptionResponse
import com.libare.adm.modules.catalog.api.dto.HomeSectionOptionResponse
import com.libare.adm.modules.catalog.api.dto.UpsertBookRequest
import com.libare.adm.modules.catalog.application.CreateBookUseCase
import com.libare.adm.modules.catalog.application.DeleteBookUseCase
import com.libare.adm.modules.catalog.application.ListAuthorOptionsUseCase
import com.libare.adm.modules.catalog.application.ListBooksUseCase
import com.libare.adm.modules.catalog.application.ListHomeSectionOptionsUseCase
import com.libare.adm.modules.catalog.application.UpdateBookUseCase
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/books")
class BookController(
    private val listBooksUseCase: ListBooksUseCase,
    private val listAuthorOptionsUseCase: ListAuthorOptionsUseCase,
    private val listHomeSectionOptionsUseCase: ListHomeSectionOptionsUseCase,
    private val createBookUseCase: CreateBookUseCase,
    private val updateBookUseCase: UpdateBookUseCase,
    private val deleteBookUseCase: DeleteBookUseCase
) {

    @GetMapping
    fun list(): ResponseEntity<List<BookResponse>> {
        val books = listBooksUseCase.execute()
        return ResponseEntity.ok(books)
    }

    @GetMapping("/author-options")
    fun listAuthorOptions(): ResponseEntity<List<AuthorOptionResponse>> {
        val options = listAuthorOptionsUseCase.execute()
        return ResponseEntity.ok(options)
    }

    @GetMapping("/home-section-options")
    fun listHomeSectionOptions(): ResponseEntity<List<HomeSectionOptionResponse>> {
        val options = listHomeSectionOptionsUseCase.execute()
        return ResponseEntity.ok(options)
    }

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertBookRequest): ResponseEntity<BookResponse> {
        val created = createBookUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{bookId}")
    fun update(
        @PathVariable bookId: Long,
        @Valid @RequestBody request: UpsertBookRequest
    ): ResponseEntity<BookResponse> {
        val updated = updateBookUseCase.execute(bookId, request)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{bookId}")
    fun delete(@PathVariable bookId: Long): ResponseEntity<Void> {
        deleteBookUseCase.execute(bookId)
        return ResponseEntity.noContent().build()
    }
}
