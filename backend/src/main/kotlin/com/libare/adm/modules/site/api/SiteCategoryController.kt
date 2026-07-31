package com.libare.adm.modules.site.api

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.site.api.dto.SiteCategoryImageUploadResponse
import com.libare.adm.modules.site.api.dto.SiteCategoryResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteCategoryRequest
import com.libare.adm.modules.site.application.CreateSiteCategoryUseCase
import com.libare.adm.modules.site.application.DeleteSiteCategoryUseCase
import com.libare.adm.modules.site.application.ListSiteCategoriesUseCase
import com.libare.adm.modules.site.application.UpdateSiteCategoryUseCase
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
    name = OpenApiTags.SITE_CATEGORIES,
    description = "Categorias do modulo Site (Galileu) gerenciadas pelo painel."
)
@RestController
@RequestMapping("/api/v1/site-categories")
class SiteCategoryController(
    private val listSiteCategoriesUseCase: ListSiteCategoriesUseCase,
    private val createSiteCategoryUseCase: CreateSiteCategoryUseCase,
    private val updateSiteCategoryUseCase: UpdateSiteCategoryUseCase,
    private val deleteSiteCategoryUseCase: DeleteSiteCategoryUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @Operation(
        summary = "Listar categorias do site",
        description = "Lista categorias cadastradas no modulo Site."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de categorias",
            content = [Content(schema = Schema(implementation = SiteCategoryResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<SiteCategoryResponse>> =
        ResponseEntity.ok(listSiteCategoriesUseCase.execute())

    @Operation(
        summary = "Criar categoria do site",
        description = "Cadastra uma nova categoria com nome e imagem."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "201",
            description = "Categoria criada",
            content = [Content(schema = Schema(implementation = SiteCategoryResponse::class))]
        )
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteCategoryRequest): ResponseEntity<SiteCategoryResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteCategoryUseCase.execute(request))

    @Operation(
        summary = "Atualizar categoria do site",
        description = "Altera dados de uma categoria existente."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Categoria atualizada",
            content = [Content(schema = Schema(implementation = SiteCategoryResponse::class))]
        )
    )
    @PutMapping("/{categoryId}")
    fun update(
        @Parameter(description = "ID da categoria do site")
        @PathVariable categoryId: Int,
        @Valid @RequestBody request: UpsertSiteCategoryRequest
    ): ResponseEntity<SiteCategoryResponse> =
        ResponseEntity.ok(updateSiteCategoryUseCase.execute(categoryId, request))

    @Operation(
        summary = "Excluir categoria do site",
        description = "Remove permanentemente uma categoria do modulo Site."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Categoria excluida")
    )
    @DeleteMapping("/{categoryId}")
    fun delete(
        @Parameter(description = "ID da categoria do site")
        @PathVariable categoryId: Int
    ): ResponseEntity<Void> {
        deleteSiteCategoryUseCase.execute(categoryId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Upload de imagem da categoria",
        description = "Envia imagem da categoria para storage legado. Requer permissao sites.create ou sites.update."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Imagem armazenada",
            content = [Content(schema = Schema(implementation = SiteCategoryImageUploadResponse::class))]
        )
    )
    @PostMapping("/upload/image")
    fun upload(
        @Parameter(description = "Arquivo de imagem da categoria")
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<SiteCategoryImageUploadResponse> {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(SiteCategoryImageUploadResponse(filename))
    }
}
