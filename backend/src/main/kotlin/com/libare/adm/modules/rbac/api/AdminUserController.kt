package com.libare.adm.modules.rbac.api

import com.libare.adm.modules.rbac.api.dto.AdminSchoolAssignmentResponse
import com.libare.adm.modules.rbac.api.dto.AssignAdminSchoolsRequest
import com.libare.adm.modules.rbac.api.dto.CreateTeamMemberRequest
import com.libare.adm.modules.rbac.api.dto.TeamMemberResponse
import com.libare.adm.modules.rbac.api.dto.ToggleTeamMemberStatusRequest
import com.libare.adm.modules.rbac.application.AssignAdminSchoolsUseCase
import com.libare.adm.modules.rbac.application.CreateTeamMemberUseCase
import com.libare.adm.modules.rbac.application.ListTeamMembersUseCase
import com.libare.adm.modules.rbac.application.ToggleTeamMemberStatusUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiHeaders
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = OpenApiTags.TEAM,
    description = "Staff do painel (app_admin_users): SCHOOL_ADMIN e PROFESSOR. " +
        "SUPER cria ambos; SCHOOL_ADMIN cria apenas PROFESSOR."
)
@RestController
@RequestMapping("/api/v1/admin-users")
class AdminUserController(
    private val assignAdminSchoolsUseCase: AssignAdminSchoolsUseCase,
    private val listTeamMembersUseCase: ListTeamMembersUseCase,
    private val createTeamMemberUseCase: CreateTeamMemberUseCase,
    private val toggleTeamMemberStatusUseCase: ToggleTeamMemberStatusUseCase
) {
    @Operation(
        summary = "Listar equipe",
        description = "Lista admins/professores filtrados pela escola do contexto (ou todas, se SUPER sem contexto)."
    )
    @AdminSecured
    @Parameter(
        name = OpenApiHeaders.SCHOOL_CONTEXT,
        `in` = ParameterIn.HEADER,
        description = OpenApiHeaders.SCHOOL_CONTEXT_DESC,
        required = false,
        schema = Schema(type = "integer", format = "int64")
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Membros da equipe",
                content = [Content(array = ArraySchema(schema = Schema(implementation = TeamMemberResponse::class)))]
            )
        ]
    )
    @GetMapping
    fun list(): ResponseEntity<List<TeamMemberResponse>> =
        ResponseEntity.ok(listTeamMembersUseCase.execute())

    @Operation(
        summary = "Criar membro da equipe",
        description = "Cria login do painel com perfil SCHOOL_ADMIN ou PROFESSOR na escola informada. " +
            "SCHOOL_ADMIN so pode criar PROFESSOR."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "Membro criado",
                content = [Content(schema = Schema(implementation = TeamMemberResponse::class))]
            )
        ]
    )
    @PostMapping
    fun create(@Valid @RequestBody request: CreateTeamMemberRequest): ResponseEntity<TeamMemberResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createTeamMemberUseCase.execute(request))

    @Operation(
        summary = "Ativar ou desativar membro da equipe",
        description = "Altera o status (0/1) de um admin/professor. Requer team.toggle_status. " +
            "Nao permite alterar o proprio usuario nem Super Admin."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Status atualizado",
                content = [Content(schema = Schema(implementation = TeamMemberResponse::class))]
            )
        ]
    )
    @PatchMapping("/{adminUserId}/status")
    fun toggleStatus(
        @Parameter(description = "ID do admin do painel") @PathVariable adminUserId: Long,
        @Valid @RequestBody request: ToggleTeamMemberStatusRequest
    ): ResponseEntity<TeamMemberResponse> =
        ResponseEntity.ok(toggleTeamMemberStatusUseCase.execute(adminUserId, request.status))

    @Operation(
        summary = "Atribuir escolas ao admin",
        description = "Substitui os vinculos de escolas do membro da equipe (uso avancado / SUPER)."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Vinculos atualizados")])
    @PutMapping("/{adminUserId}/schools")
    fun assignSchools(
        @Parameter(description = "ID do admin do painel") @PathVariable adminUserId: Long,
        @Valid @RequestBody request: AssignAdminSchoolsRequest
    ): ResponseEntity<AdminSchoolAssignmentResponse> =
        ResponseEntity.ok(assignAdminSchoolsUseCase.execute(adminUserId, request.schoolIds))
}
