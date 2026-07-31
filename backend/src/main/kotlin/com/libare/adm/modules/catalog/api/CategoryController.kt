package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.CategoryImageUploadResponse
import com.libare.adm.modules.catalog.api.dto.CategoryOptionResponse
import com.libare.adm.modules.catalog.api.dto.CategoryResponse
import com.libare.adm.modules.catalog.api.dto.UpsertCategoryRequest
import com.libare.adm.modules.catalog.application.CreateCategoryUseCase
import com.libare.adm.modules.catalog.application.DeleteCategoryUseCase
import com.libare.adm.modules.catalog.application.ListCategoriesUseCase
import com.libare.adm.modules.catalog.application.ListCategoryOptionsUseCase
import com.libare.adm.modules.catalog.application.UpdateCategoryUseCase
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

@Tag(name = OpenApiTags.CATEGORIES, description = "Gestao de categorias do catalogo")
@AdminSecured
@RestController
@RequestMapping("/api/v1/categories")
class CategoryController(
    private val listCategoriesUseCase: ListCategoriesUseCase,
    private val listCategoryOptionsUseCase: ListCategoryOptionsUseCase,
    private val createCategoryUseCase: CreateCategoryUseCase,
    private val updateCategoryUseCase: UpdateCategoryUseCase,
    private val deleteCategoryUseCase: DeleteCategoryUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @Operation(
        summary = "Listar categorias",
        description = "Retorna todas as categorias cadastradas. Requer permissao books.view."
    )
    @ApiResponse(responseCode = "200", description = "Lista de categorias")
    @GetMapping
    fun list(): ResponseEntity<List<CategoryResponse>> =
        ResponseEntity.ok(listCategoriesUseCase.execute())

    @Operation(
        summary = "Opcoes de categorias",
        description = "Lista categorias ativas para selecao em formularios."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de categorias")
    @GetMapping("/options")
    fun options(): ResponseEntity<List<CategoryOptionResponse>> =
        ResponseEntity.ok(listCategoryOptionsUseCase.execute())

    @Operation(
        summary = "Upload de imagem da categoria",
        description = "Envia imagem da categoria e retorna o nome do arquivo. Requer permissao books.create ou books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Imagem armazenada com sucesso")
    @PostMapping("/upload/image")
    fun upload(
        @Parameter(description = "Arquivo de imagem da categoria", required = true)
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<CategoryImageUploadResponse> {
        if (!authorizationService.can("books.create") && !authorizationService.can("books.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(CategoryImageUploadResponse(filename))
    }

    @Operation(
        summary = "Criar categoria",
        description = "Cadastra uma nova categoria. Requer permissao books.create."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "201", description = "Categoria criada")
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertCategoryRequest): ResponseEntity<CategoryResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createCategoryUseCase.execute(request))

    @Operation(
        summary = "Atualizar categoria",
        description = "Atualiza dados de uma categoria existente. Requer permissao books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Categoria atualizada")
    @PutMapping("/{categoryId}")
    fun update(
        @Parameter(description = "ID da categoria", required = true)
        @PathVariable categoryId: Int,
        @Valid @RequestBody request: UpsertCategoryRequest
    ): ResponseEntity<CategoryResponse> =
        ResponseEntity.ok(updateCategoryUseCase.execute(categoryId, request))

    @Operation(
        summary = "Excluir categoria",
        description = "Remove uma categoria do catalogo. Requer permissao books.delete."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "204", description = "Categoria excluida")
    @DeleteMapping("/{categoryId}")
    fun delete(
        @Parameter(description = "ID da categoria", required = true)
        @PathVariable categoryId: Int
    ): ResponseEntity<Void> {
        deleteCategoryUseCase.execute(categoryId)
        return ResponseEntity.noContent().build()
    }
}
