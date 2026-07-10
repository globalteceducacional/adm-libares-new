package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.AcervoOptionResponse
import com.libare.adm.modules.catalog.api.dto.AcervoResponse
import com.libare.adm.modules.catalog.api.dto.UpsertAcervoRequest
import com.libare.adm.modules.catalog.application.CreateAcervoUseCase
import com.libare.adm.modules.catalog.application.DeleteAcervoUseCase
import com.libare.adm.modules.catalog.application.GetAcervoUseCase
import com.libare.adm.modules.catalog.application.ListAcervoOptionsUseCase
import com.libare.adm.modules.catalog.application.ListAcervosUseCase
import com.libare.adm.modules.catalog.application.UpdateAcervoUseCase
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
@RequestMapping("/api/v1/acervos")
class AcervoController(
    private val listAcervosUseCase: ListAcervosUseCase,
    private val listAcervoOptionsUseCase: ListAcervoOptionsUseCase,
    private val getAcervoUseCase: GetAcervoUseCase,
    private val createAcervoUseCase: CreateAcervoUseCase,
    private val updateAcervoUseCase: UpdateAcervoUseCase,
    private val deleteAcervoUseCase: DeleteAcervoUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<AcervoResponse>> =
        ResponseEntity.ok(listAcervosUseCase.execute())

    @GetMapping("/options")
    fun listOptions(): ResponseEntity<List<AcervoOptionResponse>> =
        ResponseEntity.ok(listAcervoOptionsUseCase.execute())

    @GetMapping("/{acervoId}")
    fun get(@PathVariable acervoId: Long): ResponseEntity<AcervoResponse> =
        ResponseEntity.ok(getAcervoUseCase.execute(acervoId))

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertAcervoRequest): ResponseEntity<AcervoResponse> {
        val created = createAcervoUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{acervoId}")
    fun update(
        @PathVariable acervoId: Long,
        @Valid @RequestBody request: UpsertAcervoRequest
    ): ResponseEntity<AcervoResponse> =
        ResponseEntity.ok(updateAcervoUseCase.execute(acervoId, request))

    @DeleteMapping("/{acervoId}")
    fun delete(@PathVariable acervoId: Long): ResponseEntity<Void> {
        deleteAcervoUseCase.execute(acervoId)
        return ResponseEntity.noContent().build()
    }
}
