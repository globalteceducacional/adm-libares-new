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

@Tag(name = OpenApiTags.SCHOOLS, description = "Cadastro e gestao de contratos (tenants do sistema)")
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
        summary = "Listar contratos",
        description = "Retorno contratos acessiveis ao usuario logado (SUPER ve todas; demais veem contratos vinculados)."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Lista de contratos")
    )
    @GetMapping
    fun list(): ResponseEntity<List<SchoolResponse>> =
        ResponseEntity.ok(listSchoolsUseCase.execute())

    @Operation(
        summary = "Obter contrato por ID",
        description = "Retorna detalhes de um contrato especifico."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Dados do contrato"),
        ApiResponse(responseCode = "404", description = "Contrato nao encontrado")
    )
    @GetMapping("/{schoolId}")
    fun get(
        @Parameter(description = "ID do contrato")
        @PathVariable schoolId: Long
    ): ResponseEntity<SchoolResponse> =
        ResponseEntity.ok(getSchoolUseCase.execute(schoolId))

    @Operation(
        summary = "Criar contrato",
        description = "Cadastra uma novo contrato (tenant). Requer perfil SUPER."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Contrato criado com sucesso")
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSchoolRequest): ResponseEntity<SchoolResponse> {
        val created = createSchoolUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @Operation(
        summary = "Atualizar contrato",
        description = "Altera nome, slug ou status de um contrato existente."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Contrato atualizado com sucesso")
    )
    @PutMapping("/{schoolId}")
    fun update(
        @Parameter(description = "ID do contrato")
        @PathVariable schoolId: Long,
        @Valid @RequestBody request: UpsertSchoolRequest
    ): ResponseEntity<SchoolResponse> =
        ResponseEntity.ok(updateSchoolUseCase.execute(schoolId, request))

    @Operation(
        summary = "Excluir contrato",
        description = "Remove permanentemente um contrato e seus vinculos."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Contrato excluido com sucesso")
    )
    @DeleteMapping("/{schoolId}")
    fun delete(
        @Parameter(description = "ID do contrato")
        @PathVariable schoolId: Long
    ): ResponseEntity<Void> {
        deleteSchoolUseCase.execute(schoolId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Criar administrador do contrato",
        description = "Cadastra um usuario SCHOOL_ADMIN vinculado ao contrato informado."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Administrador do contrato criado com sucesso")
    )
    @PostMapping("/{schoolId}/admins")
    fun createAdmin(
        @Parameter(description = "ID do contrato")
        @PathVariable schoolId: Long,
        @Valid @RequestBody request: CreateSchoolAdminRequest
    ): ResponseEntity<SchoolAdminResponse> {
        val created = createSchoolAdminUseCase.execute(schoolId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }
}
