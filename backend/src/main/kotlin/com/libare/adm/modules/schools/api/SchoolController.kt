package com.libare.adm.modules.schools.api

import com.libare.adm.modules.schools.api.dto.CreateSchoolAdminRequest
import com.libare.adm.modules.schools.api.dto.SchoolAdminResponse
import com.libare.adm.modules.schools.api.dto.SchoolResponse
import com.libare.adm.modules.schools.api.dto.UpsertSchoolRequest
import com.libare.adm.modules.schools.application.CreateSchoolAdminUseCase
import com.libare.adm.modules.schools.application.CreateSchoolUseCase
import com.libare.adm.modules.schools.application.DeleteSchoolUseCase
import com.libare.adm.modules.schools.application.GetSchoolUseCase
import com.libare.adm.modules.schools.application.ListSchoolsUseCase
import com.libare.adm.modules.schools.application.UpdateSchoolUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
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

@Tag(name = OpenApiTags.SCHOOLS, description = "Cadastro e gestao de escolas (tenants do sistema)")
@RestController
@RequestMapping("/api/v1/schools")
class SchoolController(
    private val listSchoolsUseCase: ListSchoolsUseCase,
    private val getSchoolUseCase: GetSchoolUseCase,
    private val createSchoolUseCase: CreateSchoolUseCase,
    private val updateSchoolUseCase: UpdateSchoolUseCase,
    private val deleteSchoolUseCase: DeleteSchoolUseCase,
    private val createSchoolAdminUseCase: CreateSchoolAdminUseCase
) {
    @Operation(
        summary = "Listar escolas",
        description = "Retorna escolas acessiveis ao usuario logado (SUPER ve todas; demais veem escolas vinculadas)."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Lista de escolas")
    )
    @GetMapping
    fun list(): ResponseEntity<List<SchoolResponse>> =
        ResponseEntity.ok(listSchoolsUseCase.execute())

    @Operation(
        summary = "Obter escola por ID",
        description = "Retorna detalhes de uma escola especifica."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Dados da escola"),
        ApiResponse(responseCode = "404", description = "Escola nao encontrada")
    )
    @GetMapping("/{schoolId}")
    fun get(
        @Parameter(description = "ID da escola")
        @PathVariable schoolId: Long
    ): ResponseEntity<SchoolResponse> =
        ResponseEntity.ok(getSchoolUseCase.execute(schoolId))

    @Operation(
        summary = "Criar escola",
        description = "Cadastra uma nova escola (tenant). Requer perfil SUPER."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Escola criada com sucesso")
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSchoolRequest): ResponseEntity<SchoolResponse> {
        val created = createSchoolUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @Operation(
        summary = "Atualizar escola",
        description = "Altera nome, slug ou status de uma escola existente."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Escola atualizada com sucesso")
    )
    @PutMapping("/{schoolId}")
    fun update(
        @Parameter(description = "ID da escola")
        @PathVariable schoolId: Long,
        @Valid @RequestBody request: UpsertSchoolRequest
    ): ResponseEntity<SchoolResponse> =
        ResponseEntity.ok(updateSchoolUseCase.execute(schoolId, request))

    @Operation(
        summary = "Excluir escola",
        description = "Remove permanentemente uma escola e seus vinculos."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Escola excluida com sucesso")
    )
    @DeleteMapping("/{schoolId}")
    fun delete(
        @Parameter(description = "ID da escola")
        @PathVariable schoolId: Long
    ): ResponseEntity<Void> {
        deleteSchoolUseCase.execute(schoolId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Criar administrador da escola",
        description = "Cadastra um usuario SCHOOL_ADMIN vinculado a escola informada."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Administrador da escola criado com sucesso")
    )
    @PostMapping("/{schoolId}/admins")
    fun createAdmin(
        @Parameter(description = "ID da escola")
        @PathVariable schoolId: Long,
        @Valid @RequestBody request: CreateSchoolAdminRequest
    ): ResponseEntity<SchoolAdminResponse> {
        val created = createSchoolAdminUseCase.execute(schoolId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }
}
