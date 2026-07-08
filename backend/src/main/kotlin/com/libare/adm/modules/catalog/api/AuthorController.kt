package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.AuthorImageUploadResponse
import com.libare.adm.modules.catalog.api.dto.AuthorOptionResponse
import com.libare.adm.modules.catalog.api.dto.AuthorResponse
import com.libare.adm.modules.catalog.api.dto.UpsertAuthorRequest
import com.libare.adm.modules.catalog.application.CreateAuthorUseCase
import com.libare.adm.modules.catalog.application.DeleteAuthorUseCase
import com.libare.adm.modules.catalog.application.ListAuthorOptionsUseCase
import com.libare.adm.modules.catalog.application.ListAuthorsUseCase
import com.libare.adm.modules.catalog.application.UpdateAuthorUseCase
import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.security.AuthorizationService
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
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1/authors")
class AuthorController(
    private val listAuthorsUseCase: ListAuthorsUseCase,
    private val listAuthorOptionsUseCase: ListAuthorOptionsUseCase,
    private val createAuthorUseCase: CreateAuthorUseCase,
    private val updateAuthorUseCase: UpdateAuthorUseCase,
    private val deleteAuthorUseCase: DeleteAuthorUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @GetMapping
    fun list(): ResponseEntity<List<AuthorResponse>> =
        ResponseEntity.ok(listAuthorsUseCase.execute())

    @GetMapping("/options")
    fun options(): ResponseEntity<List<AuthorOptionResponse>> =
        ResponseEntity.ok(listAuthorOptionsUseCase.execute())

    @PostMapping("/upload/image")
    fun upload(@RequestParam("file") file: MultipartFile): ResponseEntity<AuthorImageUploadResponse> {
        if (!authorizationService.can("books.create") && !authorizationService.can("books.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(AuthorImageUploadResponse(filename))
    }

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertAuthorRequest): ResponseEntity<AuthorResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createAuthorUseCase.execute(request))

    @PutMapping("/{authorId}")
    fun update(
        @PathVariable authorId: Long,
        @Valid @RequestBody request: UpsertAuthorRequest
    ): ResponseEntity<AuthorResponse> =
        ResponseEntity.ok(updateAuthorUseCase.execute(authorId, request))

    @DeleteMapping("/{authorId}")
    fun delete(@PathVariable authorId: Long): ResponseEntity<Void> {
        deleteAuthorUseCase.execute(authorId)
        return ResponseEntity.noContent().build()
    }
}
