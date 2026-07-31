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
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiHeaders
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

@Tag(name = OpenApiTags.ACERVOS, description = "Gestao de acervos por escola")
@AdminSecured
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
    @Operation(
        summary = "Listar acervos",
        description = "Retorna acervos da escola do contexto. Requer permissao acervos.view. Use o header ${OpenApiHeaders.SCHOOL_CONTEXT} quando necessario: ${OpenApiHeaders.SCHOOL_CONTEXT_DESC}"
    )
    @ApiResponse(responseCode = "200", description = "Lista de acervos da escola ativa")
    @GetMapping
    fun list(): ResponseEntity<List<AcervoResponse>> =
        ResponseEntity.ok(listAcervosUseCase.execute())

    @Operation(
        summary = "Opcoes de acervos",
        description = "Lista acervos ativos para selecao em formularios. Filtrado pela escola do contexto (${OpenApiHeaders.SCHOOL_CONTEXT})."
    )
    @ApiResponse(responseCode = "200", description = "Opcoes de acervos")
    @GetMapping("/options")
    fun listOptions(): ResponseEntity<List<AcervoOptionResponse>> =
        ResponseEntity.ok(listAcervoOptionsUseCase.execute())

    @Operation(
        summary = "Obter acervo",
        description = "Retorna detalhes de um acervo, incluindo contagem de livros e usuarios."
    )
    @ApiResponse(responseCode = "200", description = "Detalhes do acervo")
    @GetMapping("/{acervoId}")
    fun get(
        @Parameter(description = "ID do acervo", required = true)
        @PathVariable acervoId: Long
    ): ResponseEntity<AcervoResponse> =
        ResponseEntity.ok(getAcervoUseCase.execute(acervoId))

    @Operation(
        summary = "Criar acervo",
        description = "Cadastra um novo acervo na escola do contexto. Requer permissao acervos.create."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "201", description = "Acervo criado")
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertAcervoRequest): ResponseEntity<AcervoResponse> {
        val created = createAcervoUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @Operation(
        summary = "Atualizar acervo",
        description = "Atualiza nome, descricao e status de um acervo. Requer permissao acervos.update."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "200", description = "Acervo atualizado")
    @PutMapping("/{acervoId}")
    fun update(
        @Parameter(description = "ID do acervo", required = true)
        @PathVariable acervoId: Long,
        @Valid @RequestBody request: UpsertAcervoRequest
    ): ResponseEntity<AcervoResponse> =
        ResponseEntity.ok(updateAcervoUseCase.execute(acervoId, request))

    @Operation(
        summary = "Excluir acervo",
        description = "Remove um acervo da escola. Requer permissao acervos.delete."
    )
    @AdminWriteResponses
    @ApiResponse(responseCode = "204", description = "Acervo excluido")
    @DeleteMapping("/{acervoId}")
    fun delete(
        @Parameter(description = "ID do acervo", required = true)
        @PathVariable acervoId: Long
    ): ResponseEntity<Void> {
        deleteAcervoUseCase.execute(acervoId)
        return ResponseEntity.noContent().build()
    }
}
