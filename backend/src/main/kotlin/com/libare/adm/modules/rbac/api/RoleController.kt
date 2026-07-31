package com.libare.adm.modules.rbac.api

import com.libare.adm.modules.rbac.api.dto.PermissionResponse
import com.libare.adm.modules.rbac.api.dto.RoleResponse
import com.libare.adm.modules.rbac.api.dto.UpsertRoleRequest
import com.libare.adm.modules.rbac.application.CreateRoleUseCase
import com.libare.adm.modules.rbac.application.DeleteRoleUseCase
import com.libare.adm.modules.rbac.application.GetRoleUseCase
import com.libare.adm.modules.rbac.application.ListPermissionsUseCase
import com.libare.adm.modules.rbac.application.ListRolesUseCase
import com.libare.adm.modules.rbac.application.UpdateRoleUseCase
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
    name = OpenApiTags.ROLES,
    description = "Perfis (roles) e permissoes do painel admin (RBAC)."
)
@RestController
@RequestMapping("/api/v1/roles")
class RoleController(
    private val listRolesUseCase: ListRolesUseCase,
    private val getRoleUseCase: GetRoleUseCase,
    private val listPermissionsUseCase: ListPermissionsUseCase,
    private val createRoleUseCase: CreateRoleUseCase,
    private val updateRoleUseCase: UpdateRoleUseCase,
    private val deleteRoleUseCase: DeleteRoleUseCase
) {
    @Operation(
        summary = "Listar perfis",
        description = "Retorna todos os perfis (roles) cadastrados com suas permissoes."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de perfis",
            content = [Content(schema = Schema(implementation = RoleResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<RoleResponse>> =
        ResponseEntity.ok(listRolesUseCase.execute())

    @Operation(
        summary = "Listar permissoes disponiveis",
        description = "Catalogo de codigos de permissao que podem ser atribuidos a um perfil."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de permissoes",
            content = [Content(schema = Schema(implementation = PermissionResponse::class))]
        )
    )
    @GetMapping("/permissions")
    fun listPermissions(): ResponseEntity<List<PermissionResponse>> =
        ResponseEntity.ok(listPermissionsUseCase.execute())

    @Operation(
        summary = "Obter perfil por ID",
        description = "Detalhes de um perfil incluindo permissoes vinculadas."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Perfil encontrado",
            content = [Content(schema = Schema(implementation = RoleResponse::class))]
        )
    )
    @GetMapping("/{roleId}")
    fun get(
        @Parameter(description = "ID do perfil (role)")
        @PathVariable roleId: Long
    ): ResponseEntity<RoleResponse> =
        ResponseEntity.ok(getRoleUseCase.execute(roleId))

    @Operation(
        summary = "Criar perfil",
        description = "Cadastra um novo perfil com nome, status e lista de permissoes."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "201",
            description = "Perfil criado",
            content = [Content(schema = Schema(implementation = RoleResponse::class))]
        )
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertRoleRequest): ResponseEntity<RoleResponse> {
        val created = createRoleUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @Operation(
        summary = "Atualizar perfil",
        description = "Altera nome, status e permissoes de um perfil existente."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Perfil atualizado",
            content = [Content(schema = Schema(implementation = RoleResponse::class))]
        )
    )
    @PutMapping("/{roleId}")
    fun update(
        @Parameter(description = "ID do perfil (role)")
        @PathVariable roleId: Long,
        @Valid @RequestBody request: UpsertRoleRequest
    ): ResponseEntity<RoleResponse> =
        ResponseEntity.ok(updateRoleUseCase.execute(roleId, request))

    @Operation(
        summary = "Excluir perfil",
        description = "Remove permanentemente um perfil. Perfis em uso podem ser rejeitados."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Perfil excluido")
    )
    @DeleteMapping("/{roleId}")
    fun delete(
        @Parameter(description = "ID do perfil (role)")
        @PathVariable roleId: Long
    ): ResponseEntity<Void> {
        deleteRoleUseCase.execute(roleId)
        return ResponseEntity.noContent().build()
    }
}
