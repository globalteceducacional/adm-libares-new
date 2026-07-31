package com.libare.adm.modules.site.api

import com.libare.adm.modules.site.api.dto.SiteSectionResponse
import com.libare.adm.modules.site.api.dto.UpsertSiteSectionRequest
import com.libare.adm.modules.site.application.CreateSiteSectionUseCase
import com.libare.adm.modules.site.application.DeleteSiteSectionUseCase
import com.libare.adm.modules.site.application.ListSiteSectionsUseCase
import com.libare.adm.modules.site.application.UpdateSiteSectionUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
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
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = OpenApiTags.SITE_SECTIONS,
    description = "Secoes da home do modulo Site (Galileu) gerenciadas pelo painel."
)
@RestController
@RequestMapping("/api/v1/site-sections")
class SiteSectionController(
    private val listSiteSectionsUseCase: ListSiteSectionsUseCase,
    private val createSiteSectionUseCase: CreateSiteSectionUseCase,
    private val updateSiteSectionUseCase: UpdateSiteSectionUseCase,
    private val deleteSiteSectionUseCase: DeleteSiteSectionUseCase
) {
    @Operation(
        summary = "Listar secoes do site",
        description = "Lista secoes da home com conteudos vinculados."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de secoes",
            content = [Content(schema = Schema(implementation = SiteSectionResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<SiteSectionResponse>> =
        ResponseEntity.ok(listSiteSectionsUseCase.execute())

    @Operation(
        summary = "Criar secao do site",
        description = "Cadastra uma nova secao da home com titulo e conteudos associados."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "201",
            description = "Secao criada",
            content = [Content(schema = Schema(implementation = SiteSectionResponse::class))]
        )
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteSectionRequest): ResponseEntity<SiteSectionResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteSectionUseCase.execute(request))

    @Operation(
        summary = "Atualizar secao do site",
        description = "Altera titulo, conteudos vinculados e status de uma secao existente."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Secao atualizada",
            content = [Content(schema = Schema(implementation = SiteSectionResponse::class))]
        )
    )
    @PutMapping("/{sectionId}")
    fun update(
        @Parameter(description = "ID da secao do site")
        @PathVariable sectionId: Int,
        @Valid @RequestBody request: UpsertSiteSectionRequest
    ): ResponseEntity<SiteSectionResponse> =
        ResponseEntity.ok(updateSiteSectionUseCase.execute(sectionId, request))

    @Operation(
        summary = "Excluir secao do site",
        description = "Remove permanentemente uma secao da home do modulo Site."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Secao excluida")
    )
    @DeleteMapping("/{sectionId}")
    fun delete(
        @Parameter(description = "ID da secao do site")
        @PathVariable sectionId: Int
    ): ResponseEntity<Void> {
        deleteSiteSectionUseCase.execute(sectionId)
        return ResponseEntity.noContent().build()
    }
}
