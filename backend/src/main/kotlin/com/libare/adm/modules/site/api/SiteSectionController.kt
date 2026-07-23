package com.libare.adm.modules.site.api

import com.libare.adm.modules.site.api.dto.SiteSectionResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteSectionRequest
import com.libare.adm.modules.site.application.CreateSiteSectionUseCase
import com.libare.adm.modules.site.application.DeleteSiteSectionUseCase
import com.libare.adm.modules.site.application.ListSiteSectionsUseCase
import com.libare.adm.modules.site.application.UpdateSiteSectionUseCase
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
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/site-sections")
class SiteSectionController(
    private val listSiteSectionsUseCase: ListSiteSectionsUseCase,
    private val createSiteSectionUseCase: CreateSiteSectionUseCase,
    private val updateSiteSectionUseCase: UpdateSiteSectionUseCase,
    private val deleteSiteSectionUseCase: DeleteSiteSectionUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<SiteSectionResponse>> =
        ResponseEntity.ok(listSiteSectionsUseCase.execute())

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteSectionRequest): ResponseEntity<SiteSectionResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteSectionUseCase.execute(request))

    @PutMapping("/{sectionId}")
    fun update(
        @PathVariable sectionId: Int,
        @Valid @RequestBody request: UpsertSiteSectionRequest
    ): ResponseEntity<SiteSectionResponse> =
        ResponseEntity.ok(updateSiteSectionUseCase.execute(sectionId, request))

    @DeleteMapping("/{sectionId}")
    fun delete(@PathVariable sectionId: Int): ResponseEntity<Void> {
        deleteSiteSectionUseCase.execute(sectionId)
        return ResponseEntity.noContent().build()
    }
}
