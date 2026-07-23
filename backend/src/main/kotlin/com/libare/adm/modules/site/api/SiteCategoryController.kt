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
@RequestMapping("/api/v1/site-categories")
class SiteCategoryController(
    private val listSiteCategoriesUseCase: ListSiteCategoriesUseCase,
    private val createSiteCategoryUseCase: CreateSiteCategoryUseCase,
    private val updateSiteCategoryUseCase: UpdateSiteCategoryUseCase,
    private val deleteSiteCategoryUseCase: DeleteSiteCategoryUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @GetMapping
    fun list(): ResponseEntity<List<SiteCategoryResponse>> =
        ResponseEntity.ok(listSiteCategoriesUseCase.execute())

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteCategoryRequest): ResponseEntity<SiteCategoryResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteCategoryUseCase.execute(request))

    @PutMapping("/{categoryId}")
    fun update(
        @PathVariable categoryId: Int,
        @Valid @RequestBody request: UpsertSiteCategoryRequest
    ): ResponseEntity<SiteCategoryResponse> =
        ResponseEntity.ok(updateSiteCategoryUseCase.execute(categoryId, request))

    @DeleteMapping("/{categoryId}")
    fun delete(@PathVariable categoryId: Int): ResponseEntity<Void> {
        deleteSiteCategoryUseCase.execute(categoryId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/upload/image")
    fun upload(@RequestParam("file") file: MultipartFile): ResponseEntity<SiteCategoryImageUploadResponse> {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(SiteCategoryImageUploadResponse(filename))
    }
}
