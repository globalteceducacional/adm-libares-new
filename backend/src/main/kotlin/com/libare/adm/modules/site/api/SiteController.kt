package com.libare.adm.modules.site.api

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.site.api.dto.SiteCoverUploadResponse
import com.libare.adm.modules.site.api.dto.SiteFileUploadResponse
import com.libare.adm.modules.site.api.dto.SiteResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteRequest
import com.libare.adm.modules.site.application.CreateSiteUseCase
import com.libare.adm.modules.site.application.DeleteSiteUseCase
import com.libare.adm.modules.site.application.ListSitesUseCase
import com.libare.adm.modules.site.application.UpdateSiteUseCase
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
@RequestMapping("/api/v1/sites")
class SiteController(
    private val listSitesUseCase: ListSitesUseCase,
    private val createSiteUseCase: CreateSiteUseCase,
    private val updateSiteUseCase: UpdateSiteUseCase,
    private val deleteSiteUseCase: DeleteSiteUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @GetMapping
    fun list(): ResponseEntity<List<SiteResponse>> =
        ResponseEntity.ok(listSitesUseCase.execute())

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteRequest): ResponseEntity<SiteResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteUseCase.execute(request))

    @PutMapping("/{siteId}")
    fun update(
        @PathVariable siteId: Long,
        @Valid @RequestBody request: UpsertSiteRequest
    ): ResponseEntity<SiteResponse> =
        ResponseEntity.ok(updateSiteUseCase.execute(siteId, request))

    @DeleteMapping("/{siteId}")
    fun delete(@PathVariable siteId: Long): ResponseEntity<Void> {
        deleteSiteUseCase.execute(siteId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/upload/cover")
    fun uploadCover(@RequestParam("file") file: MultipartFile): ResponseEntity<SiteCoverUploadResponse> {
        requireUploadPermission()
        val filename = legacyBookAssetStorage.storeCover(file)
        return ResponseEntity.ok(SiteCoverUploadResponse(filename = filename))
    }

    @PostMapping("/upload/file")
    fun uploadFile(@RequestParam("file") file: MultipartFile): ResponseEntity<SiteFileUploadResponse> {
        requireUploadPermission()
        val stored = legacyBookAssetStorage.storeBookFile(file)
        return ResponseEntity.ok(
            SiteFileUploadResponse(
                filename = stored.filename,
                fileUrl = stored.fileUrl
            )
        )
    }

    private fun requireUploadPermission() {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            throw ForbiddenException("Permissao negada")
        }
    }
}
