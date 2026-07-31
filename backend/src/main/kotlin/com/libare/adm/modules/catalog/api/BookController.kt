package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.AuthorOptionResponse
import com.libare.adm.modules.catalog.api.dto.BookCoverUploadResponse
import com.libare.adm.modules.catalog.api.dto.BookFileUploadResponse
import com.libare.adm.modules.catalog.api.dto.BookResponse
import com.libare.adm.modules.catalog.api.dto.CategoryOptionResponse
import com.libare.adm.modules.catalog.api.dto.HomeSectionOptionResponse
import com.libare.adm.modules.catalog.api.dto.ToggleBookStatusRequest
import com.libare.adm.modules.catalog.api.dto.UpsertBookRequest
import com.libare.adm.modules.catalog.application.CreateBookUseCase
import com.libare.adm.modules.catalog.application.DeleteBookUseCase
import com.libare.adm.modules.catalog.application.ListAuthorOptionsUseCase
import com.libare.adm.modules.catalog.application.ListBooksUseCase
import com.libare.adm.modules.catalog.application.ListCategoryOptionsUseCase
import com.libare.adm.modules.catalog.application.ListHomeSectionOptionsUseCase
import com.libare.adm.modules.catalog.application.ToggleBookStatusUseCase
import com.libare.adm.modules.catalog.application.UpdateBookUseCase
import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiHeaders
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@Tag(name = OpenApiTags.BOOKS, description = "Gestao de livros do catalogo admin")
@AdminSecured
@RestController
@RequestMapping("/api/v1/books")
class BookController(
    private val listBooksUseCase: ListBooksUseCase,
    private val listAuthorOptionsUseCase: ListAuthorOptionsUseCase,
    private val listCategoryOptionsUseCase: ListCategoryOptionsUseCase,
    private val listHomeSectionOptionsUseCase: ListHomeSectionOptionsUseCase,
    private val createBookUseCase: CreateBookUseCase,
    private val updateBookUseCase: UpdateBookUseCase,
    private val toggleBookStatusUseCase: ToggleBookStatusUseCase,
    private val deleteBookUseCase: DeleteBookUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage
) {

    @Operation(
        summary = "Listar livros",
        description = "Retorna livros acessiveis na escola do contexto. Requer permissao books.view. Use o header ${OpenApiHeaders.SCHOOL_CONTEXT} quando necessario: ${OpenApiHeaders.SCHOOL_CONTEXT_DESC}"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Lista de livros da escola ativa")
        ]
    )
    @GetMapping
    fun list(
        @Parameter(description = "Filtra livros vinculados ao acervo informado")
        @RequestParam(required = false) acervoId: Long?
    ): ResponseEntity<List<BookResponse>> {
        val books = listBooksUseCase.execute(acervoId)
        return ResponseEntity.ok(books)
    }

    @Operation(
        summary = "Opcoes de autores",
        description = "Lista autores disponiveis para preenchimento de formularios de livro."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de autores")
    @GetMapping("/author-options")
    fun listAuthorOptions(): ResponseEntity<List<AuthorOptionResponse>> {
        val options = listAuthorOptionsUseCase.execute()
        return ResponseEntity.ok(options)
    }

    @Operation(
        summary = "Opcoes de categorias",
        description = "Lista categorias disponiveis para preenchimento de formularios de livro."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de categorias")
    @GetMapping("/category-options")
    fun listCategoryOptions(): ResponseEntity<List<CategoryOptionResponse>> {
        val options = listCategoryOptionsUseCase.execute()
        return ResponseEntity.ok(options)
    }

    @Operation(
        summary = "Opcoes de secoes da home",
        description = "Lista secoes da home disponiveis para vinculo ao livro."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de secoes da home")
    @GetMapping("/home-section-options")
    fun listHomeSectionOptions(): ResponseEntity<List<HomeSectionOptionResponse>> {
        val options = listHomeSectionOptionsUseCase.execute()
        return ResponseEntity.ok(options)
    }

    @Operation(
        summary = "Upload de capa",
        description = "Envia imagem de capa e retorna o nome do arquivo armazenado. Requer permissao books.create ou books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Capa armazenada com sucesso")
    @PostMapping("/upload/cover")
    fun uploadCover(
        @Parameter(description = "Arquivo de imagem da capa", required = true)
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<BookCoverUploadResponse> {
        val filename = legacyBookAssetStorage.storeCover(file)
        return ResponseEntity.ok(BookCoverUploadResponse(filename = filename))
    }

    @Operation(
        summary = "Upload de arquivo do livro",
        description = "Envia PDF ou outro arquivo do livro e retorna filename e fileUrl. Requer permissao books.create ou books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Arquivo armazenado com sucesso")
    @PostMapping("/upload/file")
    fun uploadBookFile(
        @Parameter(description = "Arquivo do livro (PDF, EPUB, etc.)", required = true)
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<BookFileUploadResponse> {
        val stored = legacyBookAssetStorage.storeBookFile(file)
        return ResponseEntity.ok(
            BookFileUploadResponse(
                filename = stored.filename,
                fileUrl = stored.fileUrl
            )
        )
    }

    @Operation(
        summary = "Criar livro",
        description = "Cadastra um novo livro no catalogo. Requer permissao books.create."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "201", description = "Livro criado")
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertBookRequest): ResponseEntity<BookResponse> {
        val created = createBookUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @Operation(
        summary = "Atualizar livro",
        description = "Atualiza todos os dados de um livro existente. Requer permissao books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Livro atualizado")
    @PutMapping("/{bookId}")
    fun update(
        @Parameter(description = "ID do livro", required = true)
        @PathVariable bookId: Long,
        @Valid @RequestBody request: UpsertBookRequest
    ): ResponseEntity<BookResponse> {
        val updated = updateBookUseCase.execute(bookId, request)
        return ResponseEntity.ok(updated)
    }

    @Operation(
        summary = "Alternar status do livro",
        description = "Ativa ou desativa um livro (status 0 ou 1). Requer permissao books.toggle_status (ex.: role PROFESSOR). O livro deve pertencer a um acervo da escola do contexto — use o header ${OpenApiHeaders.SCHOOL_CONTEXT}: ${OpenApiHeaders.SCHOOL_CONTEXT_DESC}"
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Status atualizado")
    @PatchMapping("/{bookId}/status")
    fun toggleStatus(
        @Parameter(description = "ID do livro", required = true)
        @PathVariable bookId: Long,
        @Valid @RequestBody request: ToggleBookStatusRequest
    ): ResponseEntity<BookResponse> {
        val updated = toggleBookStatusUseCase.execute(bookId, request.status)
        return ResponseEntity.ok(updated)
    }

    @Operation(
        summary = "Excluir livro",
        description = "Remove um livro do catalogo. Requer permissao books.delete."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "204", description = "Livro excluido")
    @DeleteMapping("/{bookId}")
    fun delete(
        @Parameter(description = "ID do livro", required = true)
        @PathVariable bookId: Long
    ): ResponseEntity<Void> {
        deleteBookUseCase.execute(bookId)
        return ResponseEntity.noContent().build()
    }
}
