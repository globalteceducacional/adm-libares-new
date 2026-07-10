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
@RequestMapping("/api/v1/roles")
class RoleController(
    private val listRolesUseCase: ListRolesUseCase,
    private val getRoleUseCase: GetRoleUseCase,
    private val listPermissionsUseCase: ListPermissionsUseCase,
    private val createRoleUseCase: CreateRoleUseCase,
    private val updateRoleUseCase: UpdateRoleUseCase,
    private val deleteRoleUseCase: DeleteRoleUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<RoleResponse>> =
        ResponseEntity.ok(listRolesUseCase.execute())

    @GetMapping("/permissions")
    fun listPermissions(): ResponseEntity<List<PermissionResponse>> =
        ResponseEntity.ok(listPermissionsUseCase.execute())

    @GetMapping("/{roleId}")
    fun get(@PathVariable roleId: Long): ResponseEntity<RoleResponse> =
        ResponseEntity.ok(getRoleUseCase.execute(roleId))

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertRoleRequest): ResponseEntity<RoleResponse> {
        val created = createRoleUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{roleId}")
    fun update(
        @PathVariable roleId: Long,
        @Valid @RequestBody request: UpsertRoleRequest
    ): ResponseEntity<RoleResponse> =
        ResponseEntity.ok(updateRoleUseCase.execute(roleId, request))

    @DeleteMapping("/{roleId}")
    fun delete(@PathVariable roleId: Long): ResponseEntity<Void> {
        deleteRoleUseCase.execute(roleId)
        return ResponseEntity.noContent().build()
    }
}
