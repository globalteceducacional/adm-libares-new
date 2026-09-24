package com.libare.adm.modules.catalog.application.policy

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.ForbiddenException
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

    /**
     * Resolve o contrato do acervo: body.schoolId (preferencial) ou X-School-Context.
     */
    fun resolveSchoolIdForWrite(requestedSchoolId: Long?): Long {
        requireCreate()
        val principal = TenantContext.get()
        val contextSchoolId = principal.effectiveSchoolId()

        val schoolId = requestedSchoolId ?: contextSchoolId
            ?: throw BadRequestException(
                "Informe o contrato do acervo (campo schoolId) ou selecione no topo do painel"
            )

        if (!principal.canAccessSchool(schoolId)) {
            throw ForbiddenException("Sem acesso ao contrato informado")
        }
        return schoolId
    }

    fun resolveSchoolIdForUpdate(existing: AcervoEntity, requestedSchoolId: Long?): Long {
        requireUpdate()
        val principal = TenantContext.get()

        if (requestedSchoolId == null) {
            return existing.schoolId
                ?: throw BadRequestException("Acervo sem contrato; informe schoolId para vincular")
        }

        if (!principal.canAccessSchool(requestedSchoolId)) {
            throw ForbiddenException("Sem acesso ao contrato informado")
        }
        // Trocar contrato exige acesso ao contrato atual (acervo sem contrato e livre — ADR 0006).
        assertCanModify(existing)
        return requestedSchoolId
    }

    /** Acervo com contrato: ator precisa acessa-la. Sem contrato (legado): nao reivindicado, livre. */
    fun assertCanModify(acervo: AcervoEntity) {
        authorizationService.assertSameSchoolOrUnassigned(acervo.schoolId)
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
