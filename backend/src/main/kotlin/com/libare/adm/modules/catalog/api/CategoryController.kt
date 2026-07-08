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
    @GetMapping
    fun list(): ResponseEntity<List<CategoryResponse>> =
        ResponseEntity.ok(listCategoriesUseCase.execute())

    @GetMapping("/options")
    fun options(): ResponseEntity<List<CategoryOptionResponse>> =
        ResponseEntity.ok(listCategoryOptionsUseCase.execute())

    @PostMapping("/upload/image")
    fun upload(@RequestParam("file") file: MultipartFile): ResponseEntity<CategoryImageUploadResponse> {
        if (!authorizationService.can("books.create") && !authorizationService.can("books.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(CategoryImageUploadResponse(filename))
    }

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertCategoryRequest): ResponseEntity<CategoryResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createCategoryUseCase.execute(request))

    @PutMapping("/{categoryId}")
    fun update(
        @PathVariable categoryId: Int,
        @Valid @RequestBody request: UpsertCategoryRequest
    ): ResponseEntity<CategoryResponse> =
        ResponseEntity.ok(updateCategoryUseCase.execute(categoryId, request))

    @DeleteMapping("/{categoryId}")
    fun delete(@PathVariable categoryId: Int): ResponseEntity<Void> {
        deleteCategoryUseCase.execute(categoryId)
        return ResponseEntity.noContent().build()
    }
}
