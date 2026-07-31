package com.libare.adm.modules.site.api

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.site.api.dto.SiteAuthorImageUploadResponse
import com.libare.adm.modules.site.api.dto.SiteAuthorResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteAuthorRequest
import com.libare.adm.modules.site.application.CreateSiteAuthorUseCase
import com.libare.adm.modules.site.application.DeleteSiteAuthorUseCase
import com.libare.adm.modules.site.application.ListSiteAuthorsUseCase
import com.libare.adm.modules.site.application.UpdateSiteAuthorUseCase
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
import com.libare.adm.shared.security.AuthorizationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
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

@Tag(
    name = OpenApiTags.SITE_AUTHORS,
    description = "Autores do modulo Site (Galileu) gerenciados pelo painel."
)
@RestController
@RequestMapping("/api/v1/site-authors")
class SiteAuthorController(
    private val listSiteAuthorsUseCase: ListSiteAuthorsUseCase,
    private val createSiteAuthorUseCase: CreateSiteAuthorUseCase,
    private val updateSiteAuthorUseCase: UpdateSiteAuthorUseCase,
    private val deleteSiteAuthorUseCase: DeleteSiteAuthorUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @Operation(
        summary = "Listar autores do site",
        description = "Lista autores cadastrados no modulo Site."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de autores",
            content = [Content(schema = Schema(implementation = SiteAuthorResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<SiteAuthorResponse>> =
        ResponseEntity.ok(listSiteAuthorsUseCase.execute())

    @Operation(
        summary = "Criar autor do site",
        description = "Cadastra um novo autor com nome, imagem e descricao."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "201",
            description = "Autor criado",
            content = [Content(schema = Schema(implementation = SiteAuthorResponse::class))]
        )
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteAuthorRequest): ResponseEntity<SiteAuthorResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteAuthorUseCase.execute(request))

    @Operation(
        summary = "Atualizar autor do site",
        description = "Altera dados de um autor existente."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Autor atualizado",
            content = [Content(schema = Schema(implementation = SiteAuthorResponse::class))]
        )
    )
    @PutMapping("/{authorId}")
    fun update(
        @Parameter(description = "ID do autor do site")
        @PathVariable authorId: Long,
        @Valid @RequestBody request: UpsertSiteAuthorRequest
    ): ResponseEntity<SiteAuthorResponse> =
        ResponseEntity.ok(updateSiteAuthorUseCase.execute(authorId, request))

    @Operation(
        summary = "Excluir autor do site",
        description = "Remove permanentemente um autor do modulo Site."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Autor excluido")
    )
    @DeleteMapping("/{authorId}")
    fun delete(
        @Parameter(description = "ID do autor do site")
        @PathVariable authorId: Long
    ): ResponseEntity<Void> {
        deleteSiteAuthorUseCase.execute(authorId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Upload de imagem do autor",
        description = "Envia foto do autor para storage legado. Requer permissao sites.create ou sites.update."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Imagem armazenada",
            content = [Content(schema = Schema(implementation = SiteAuthorImageUploadResponse::class))]
        )
    )
    @PostMapping("/upload/image")
    fun upload(
        @Parameter(description = "Arquivo de imagem do autor")
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<SiteAuthorImageUploadResponse> {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(SiteAuthorImageUploadResponse(filename))
    }
}
