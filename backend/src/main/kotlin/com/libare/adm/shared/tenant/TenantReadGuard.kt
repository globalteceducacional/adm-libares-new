package com.libare.adm.shared.tenant

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.util.toAcervoId
import org.springframework.stereotype.Component

@Component
class TenantReadGuard(
    private val authorizationService: AuthorizationService,
    private val acervoRepository: AcervoJpaRepository
) {
    fun tenantSchoolId(): Long? = TenantSqlGuard.tenantSchoolIdParam()

    fun requireViewPermission(permission: String) {
        authorizationService.check(permission)
    }

    fun assertAcervoAccessible(acervoId: Long) {
        val tenantSchoolId = tenantSchoolId() ?: return
        val acervo = acervoRepository.findById(acervoId.toAcervoId())
            .orElseThrow { NotFoundException("Acervo nao encontrado") }
        if (acervo.schoolId != tenantSchoolId) {
            throw ForbiddenException("Acervo nao pertence a escola do usuario")
        }
    }

    fun assertSchoolAccessible(schoolId: Long?) {
        authorizationService.assertSameSchool(schoolId)
    }

    fun filterAcervosInTenant(acervos: List<AcervoEntity>): List<AcervoEntity> {
        val tenantSchoolId = tenantSchoolId() ?: return acervos
        return acervos.filter { it.schoolId == tenantSchoolId }
    }
}
