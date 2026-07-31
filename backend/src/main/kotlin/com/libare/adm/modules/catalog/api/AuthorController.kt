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
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
import com.libare.adm.shared.security.AuthorizationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
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

@Tag(name = OpenApiTags.AUTHORS, description = "Gestao de autores do catalogo")
@AdminSecured
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
    @Operation(
        summary = "Listar autores",
        description = "Retorna todos os autores cadastrados. Requer permissao books.view."
    )
    @ApiResponse(responseCode = "200", description = "Lista de autores")
    @GetMapping
    fun list(): ResponseEntity<List<AuthorResponse>> =
        ResponseEntity.ok(listAuthorsUseCase.execute())

    @Operation(
        summary = "Opcoes de autores",
        description = "Lista autores ativos para selecao em formularios."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de autores")
    @GetMapping("/options")
    fun options(): ResponseEntity<List<AuthorOptionResponse>> =
        ResponseEntity.ok(listAuthorOptionsUseCase.execute())

    @Operation(
        summary = "Upload de imagem do autor",
        description = "Envia foto do autor e retorna o nome do arquivo. Requer permissao books.create ou books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Imagem armazenada com sucesso")
    @PostMapping("/upload/image")
    fun upload(
        @Parameter(description = "Arquivo de imagem do autor", required = true)
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<AuthorImageUploadResponse> {
        if (!authorizationService.can("books.create") && !authorizationService.can("books.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(AuthorImageUploadResponse(filename))
    }

    @Operation(
        summary = "Criar autor",
        description = "Cadastra um novo autor. Requer permissao books.create."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "201", description = "Autor criado")
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertAuthorRequest): ResponseEntity<AuthorResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createAuthorUseCase.execute(request))

    @Operation(
        summary = "Atualizar autor",
        description = "Atualiza dados de um autor existente. Requer permissao books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Autor atualizado")
    @PutMapping("/{authorId}")
    fun update(
        @Parameter(description = "ID do autor", required = true)
        @PathVariable authorId: Long,
        @Valid @RequestBody request: UpsertAuthorRequest
    ): ResponseEntity<AuthorResponse> =
        ResponseEntity.ok(updateAuthorUseCase.execute(authorId, request))

    @Operation(
        summary = "Excluir autor",
        description = "Remove um autor do catalogo. Requer permissao books.delete."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "204", description = "Autor excluido")
    @DeleteMapping("/{authorId}")
    fun delete(
        @Parameter(description = "ID do autor", required = true)
        @PathVariable authorId: Long
    ): ResponseEntity<Void> {
        deleteAuthorUseCase.execute(authorId)
        return ResponseEntity.noContent().build()
    }
}
