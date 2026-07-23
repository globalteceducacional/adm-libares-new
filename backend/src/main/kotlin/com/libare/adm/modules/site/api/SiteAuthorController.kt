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
@RequestMapping("/api/v1/site-authors")
class SiteAuthorController(
    private val listSiteAuthorsUseCase: ListSiteAuthorsUseCase,
    private val createSiteAuthorUseCase: CreateSiteAuthorUseCase,
    private val updateSiteAuthorUseCase: UpdateSiteAuthorUseCase,
    private val deleteSiteAuthorUseCase: DeleteSiteAuthorUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @GetMapping
    fun list(): ResponseEntity<List<SiteAuthorResponse>> =
        ResponseEntity.ok(listSiteAuthorsUseCase.execute())

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteAuthorRequest): ResponseEntity<SiteAuthorResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteAuthorUseCase.execute(request))

    @PutMapping("/{authorId}")
    fun update(
        @PathVariable authorId: Long,
        @Valid @RequestBody request: UpsertSiteAuthorRequest
    ): ResponseEntity<SiteAuthorResponse> =
        ResponseEntity.ok(updateSiteAuthorUseCase.execute(authorId, request))

    @DeleteMapping("/{authorId}")
    fun delete(@PathVariable authorId: Long): ResponseEntity<Void> {
        deleteSiteAuthorUseCase.execute(authorId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/upload/image")
    fun upload(@RequestParam("file") file: MultipartFile): ResponseEntity<SiteAuthorImageUploadResponse> {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            throw ForbiddenException("Permissao negada")
        }
        val filename = legacyBookAssetStorage.storeCatalogImage(file)
        return ResponseEntity.ok(SiteAuthorImageUploadResponse(filename))
    }
}
