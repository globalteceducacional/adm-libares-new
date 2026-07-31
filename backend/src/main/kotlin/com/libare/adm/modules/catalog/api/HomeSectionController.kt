package com.libare.adm.modules.catalog.api

import com.libare.adm.modules.catalog.api.dto.HomeSectionOptionResponse
import com.libare.adm.modules.catalog.api.dto.HomeSectionResponse
import com.libare.adm.modules.catalog.api.dto.UpsertHomeSectionRequest
import com.libare.adm.modules.catalog.application.CreateHomeSectionUseCase
import com.libare.adm.modules.catalog.application.DeleteHomeSectionUseCase
import com.libare.adm.modules.catalog.application.ListHomeSectionOptionsUseCase
import com.libare.adm.modules.catalog.application.ListHomeSectionsUseCase
import com.libare.adm.modules.catalog.application.UpdateHomeSectionUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
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
import org.springframework.web.bind.annotation.RestController

@Tag(name = OpenApiTags.HOME_SECTIONS, description = "Gestao de secoes da pagina inicial")
@AdminSecured
@RestController
@RequestMapping("/api/v1/home-sections")
class HomeSectionController(
    private val listHomeSectionsUseCase: ListHomeSectionsUseCase,
    private val listHomeSectionOptionsUseCase: ListHomeSectionOptionsUseCase,
    private val createHomeSectionUseCase: CreateHomeSectionUseCase,
    private val updateHomeSectionUseCase: UpdateHomeSectionUseCase,
    private val deleteHomeSectionUseCase: DeleteHomeSectionUseCase
) {
    @Operation(
        summary = "Listar secoes da home",
        description = "Retorna todas as secoes da pagina inicial. Requer permissao books.view."
    )
    @ApiResponse(responseCode = "200", description = "Lista de secoes")
    @GetMapping
    fun list(): ResponseEntity<List<HomeSectionResponse>> =
        ResponseEntity.ok(listHomeSectionsUseCase.execute())

    @Operation(
        summary = "Opcoes de secoes da home",
        description = "Lista secoes ativas para selecao em formularios."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de secoes")
    @GetMapping("/options")
    fun options(): ResponseEntity<List<HomeSectionOptionResponse>> =
        ResponseEntity.ok(listHomeSectionOptionsUseCase.execute())

    @Operation(
        summary = "Criar secao da home",
        description = "Cadastra uma nova secao da pagina inicial. Requer permissao books.create."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "201", description = "Secao criada")
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertHomeSectionRequest): ResponseEntity<HomeSectionResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createHomeSectionUseCase.execute(request))

    @Operation(
        summary = "Atualizar secao da home",
        description = "Atualiza titulo, livros vinculados e status de uma secao. Requer permissao books.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Secao atualizada")
    @PutMapping("/{sectionId}")
    fun update(
        @Parameter(description = "ID da secao", required = true)
        @PathVariable sectionId: Int,
        @Valid @RequestBody request: UpsertHomeSectionRequest
    ): ResponseEntity<HomeSectionResponse> =
        ResponseEntity.ok(updateHomeSectionUseCase.execute(sectionId, request))

    @Operation(
        summary = "Excluir secao da home",
        description = "Remove uma secao da pagina inicial. Requer permissao books.delete."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "204", description = "Secao excluida")
    @DeleteMapping("/{sectionId}")
    fun delete(
        @Parameter(description = "ID da secao", required = true)
        @PathVariable sectionId: Int
    ): ResponseEntity<Void> {
        deleteHomeSectionUseCase.execute(sectionId)
        return ResponseEntity.noContent().build()
    }
}
