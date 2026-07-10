package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.api.dto.PermissionResponse
import com.libare.adm.modules.rbac.api.dto.RoleResponse
import com.libare.adm.modules.rbac.api.dto.UpsertRoleRequest
import com.libare.adm.modules.rbac.application.policy.RolePolicy
import com.libare.adm.modules.rbac.infrastructure.persistence.entity.RoleEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PermissionJpaRepository
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.RoleJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListPermissionsUseCase(
    private val permissionRepository: PermissionJpaRepository,
    private val rolePolicy: RolePolicy
) {
    fun execute(): List<PermissionResponse> {
        rolePolicy.requireView()
        return permissionRepository.findAllByOrderByModuleAscCodeAsc()
            .filter { it.code !in SyncRolePermissionsUseCase.SCHOOL_EXCLUDED_PERMISSIONS }
            .map {
                PermissionResponse(
                    id = it.id,
                    code = it.code,
                    module = it.module,
                    description = it.description
                )
            }
    }
}

@Service
class ListRolesUseCase(
    private val roleScopeService: RoleScopeService,
    private val rolePermissionQueryService: RolePermissionQueryService,
    private val rolePolicy: RolePolicy
) {
    fun execute(): List<RoleResponse> {
        rolePolicy.requireView()
        val roles = roleScopeService.listRolesForTenant()
        val permissionsByRole = rolePermissionQueryService.findPermissionCodesByRoleIds(roles.map { it.id })
        return roles.map { toResponse(it, permissionsByRole[it.id] ?: emptyList()) }
    }
}

@Service
class GetRoleUseCase(
    private val roleRepository: RoleJpaRepository,
    private val rolePermissionQueryService: RolePermissionQueryService,
    private val rolePolicy: RolePolicy,
    private val authorizationService: com.libare.adm.shared.security.AuthorizationService
) {
    fun execute(roleId: Long): RoleResponse {
        rolePolicy.requireView()
        val role = roleRepository.findById(roleId)
            .orElseThrow { NotFoundException("Perfil nao encontrado") }
        authorizationService.assertSameSchool(role.schoolId)
        val permissions = rolePermissionQueryService.findPermissionCodesByRoleIds(listOf(role.id))[role.id] ?: emptyList()
        return toResponse(role, permissions)
    }
}

@Service
class CreateRoleUseCase(
    private val roleRepository: RoleJpaRepository,
    private val rolePolicy: RolePolicy,
    private val syncRolePermissionsUseCase: SyncRolePermissionsUseCase
) {
    @Transactional
    fun execute(request: UpsertRoleRequest): RoleResponse {
        rolePolicy.requireCreate()
        val schoolId = rolePolicy.resolveSchoolIdForWrite()
        val name = request.name.trim()
        if (roleRepository.existsBySchoolIdAndNameIgnoreCase(schoolId, name)) {
            throw BadRequestException("Ja existe um perfil com este nome nesta escola")
        }

        val saved = roleRepository.save(
            RoleEntity(
                schoolId = schoolId,
                name = name,
                isSystem = false,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )

        syncRolePermissionsUseCase.execute(saved.id, request.permissionCodes, saved.schoolId)

        return toResponse(saved, request.permissionCodes.distinct())
    }
}

@Service
class UpdateRoleUseCase(
    private val roleRepository: RoleJpaRepository,
    private val rolePolicy: RolePolicy,
    private val syncRolePermissionsUseCase: SyncRolePermissionsUseCase,
    private val rolePermissionQueryService: RolePermissionQueryService
) {
    @Transactional
    fun execute(roleId: Long, request: UpsertRoleRequest): RoleResponse {
        val existing = rolePolicy.loadForUpdate(roleId)
        val schoolId = existing.schoolId
            ?: throw BadRequestException("Perfil global nao pode ser alterado")

        val name = request.name.trim()
        if (roleRepository.existsBySchoolIdAndNameIgnoreCaseAndIdNot(schoolId, name, roleId)) {
            throw BadRequestException("Ja existe um perfil com este nome nesta escola")
        }

        val updated = roleRepository.save(
            RoleEntity(
                id = existing.id,
                schoolId = existing.schoolId,
                name = name,
                isSystem = existing.isSystem,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )

        syncRolePermissionsUseCase.execute(updated.id, request.permissionCodes, updated.schoolId)

        val permissions = rolePermissionQueryService.findPermissionCodesByRoleIds(listOf(updated.id))[updated.id]
            ?: emptyList()
        return toResponse(updated, permissions)
    }
}

@Service
class DeleteRoleUseCase(
    private val roleRepository: RoleJpaRepository,
    private val rolePolicy: RolePolicy
) {
    @Transactional
    fun execute(roleId: Long) {
        val existing = rolePolicy.loadForDelete(roleId)
        roleRepository.save(
            RoleEntity(
                id = existing.id,
                schoolId = existing.schoolId,
                name = existing.name,
                isSystem = existing.isSystem,
                status = "0"
            )
        )
    }
}

private fun toResponse(role: RoleEntity, permissionCodes: List<String>): RoleResponse =
    RoleResponse(
        id = role.id,
        schoolId = role.schoolId,
        name = role.name,
        isSystem = role.isSystem,
        status = role.status,
        permissionCodes = permissionCodes.sorted()
    )
