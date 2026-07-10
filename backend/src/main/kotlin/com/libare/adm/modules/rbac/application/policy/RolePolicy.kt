package com.libare.adm.modules.rbac.application.policy

import com.libare.adm.modules.rbac.infrastructure.persistence.entity.RoleEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.RoleJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.stereotype.Component

@Component
class RolePolicy(
    private val authorizationService: AuthorizationService,
    private val roleRepository: RoleJpaRepository
) {
    fun requireView() {
        authorizationService.check("roles.view")
    }

    fun requireCreate() {
        authorizationService.check("roles.create")
    }

    fun requireUpdate() {
        authorizationService.check("roles.update")
    }

    fun requireDelete() {
        authorizationService.check("roles.delete")
    }

    fun resolveSchoolIdForWrite(): Long {
        return TenantContext.get().effectiveSchoolId()
            ?: throw BadRequestException("Informe o contexto de escola via header X-School-Context")
    }

    fun assertCanModify(role: RoleEntity) {
        if (role.isSystem) {
            throw BadRequestException("Perfil de sistema nao pode ser alterado")
        }
        authorizationService.assertSameSchool(role.schoolId)
    }

    fun loadForUpdate(roleId: Long): RoleEntity {
        requireUpdate()
        val role = roleRepository.findById(roleId)
            .orElseThrow { NotFoundException("Perfil nao encontrado") }
        assertCanModify(role)
        return role
    }

    fun loadForDelete(roleId: Long): RoleEntity {
        requireDelete()
        val role = roleRepository.findById(roleId)
            .orElseThrow { NotFoundException("Perfil nao encontrado") }
        assertCanModify(role)
        return role
    }
}
