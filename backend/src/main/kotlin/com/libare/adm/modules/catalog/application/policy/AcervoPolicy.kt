package com.libare.adm.modules.catalog.application.policy

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.tenant.TenantContext
import com.libare.adm.shared.util.toAcervoId
import org.springframework.stereotype.Component

@Component
class AcervoPolicy(
    private val authorizationService: AuthorizationService,
    private val acervoRepository: AcervoJpaRepository
) {
    fun requireCreate() {
        authorizationService.check("acervos.create")
    }

    fun requireUpdate() {
        authorizationService.check("acervos.update")
    }

    fun requireDelete() {
        authorizationService.check("acervos.delete")
    }

    fun resolveSchoolIdForCreate(): Long {
        requireCreate()
        return TenantContext.get().effectiveSchoolId()
            ?: throw BadRequestException("Super admin deve informar contexto de escola via header X-School-Context")
    }

    fun assertCanModify(acervo: AcervoEntity) {
        authorizationService.assertSameSchool(acervo.schoolId)
    }

    fun loadForUpdate(acervoId: Long): AcervoEntity {
        requireUpdate()
        val acervo = acervoRepository.findById(acervoId.toAcervoId())
            .orElseThrow { NotFoundException("Acervo nao encontrado") }
        assertCanModify(acervo)
        return acervo
    }

    fun loadForDelete(acervoId: Long): AcervoEntity {
        requireDelete()
        val acervo = acervoRepository.findById(acervoId.toAcervoId())
            .orElseThrow { NotFoundException("Acervo nao encontrado") }
        assertCanModify(acervo)
        return acervo
    }
}
