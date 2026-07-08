package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.HomeSectionOptionResponse
import com.libare.adm.modules.catalog.api.dto.HomeSectionResponse
import com.libare.adm.modules.catalog.api.dto.UpsertHomeSectionRequest
import com.libare.adm.modules.catalog.application.CreateHomeSectionUseCase
import com.libare.adm.modules.catalog.application.DeleteHomeSectionUseCase
import com.libare.adm.modules.catalog.application.ListHomeSectionOptionsUseCase
import com.libare.adm.modules.catalog.application.ListHomeSectionsUseCase
import com.libare.adm.modules.catalog.application.UpdateHomeSectionUseCase
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
@RequestMapping("/api/v1/home-sections")
class HomeSectionController(
    private val listHomeSectionsUseCase: ListHomeSectionsUseCase,
    private val listHomeSectionOptionsUseCase: ListHomeSectionOptionsUseCase,
    private val createHomeSectionUseCase: CreateHomeSectionUseCase,
    private val updateHomeSectionUseCase: UpdateHomeSectionUseCase,
    private val deleteHomeSectionUseCase: DeleteHomeSectionUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<HomeSectionResponse>> =
        ResponseEntity.ok(listHomeSectionsUseCase.execute())

    @GetMapping("/options")
    fun options(): ResponseEntity<List<HomeSectionOptionResponse>> =
        ResponseEntity.ok(listHomeSectionOptionsUseCase.execute())

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertHomeSectionRequest): ResponseEntity<HomeSectionResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createHomeSectionUseCase.execute(request))

    @PutMapping("/{sectionId}")
    fun update(
        @PathVariable sectionId: Int,
        @Valid @RequestBody request: UpsertHomeSectionRequest
    ): ResponseEntity<HomeSectionResponse> =
        ResponseEntity.ok(updateHomeSectionUseCase.execute(sectionId, request))

    @DeleteMapping("/{sectionId}")
    fun delete(@PathVariable sectionId: Int): ResponseEntity<Void> {
        deleteHomeSectionUseCase.execute(sectionId)
        return ResponseEntity.noContent().build()
    }
}
