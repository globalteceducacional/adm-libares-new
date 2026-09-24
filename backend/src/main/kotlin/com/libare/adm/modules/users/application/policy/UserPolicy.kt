package com.libare.adm.modules.users.application.policy

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.util.toAcervoId
import org.springframework.stereotype.Component

/**
 * Regras de acesso ao leitor ([UserEntity]).
 * O contrato do leitor e sempre derivada do acervo (ADR 0006): sem acervo = nao reivindicado.
 */
@Component
class UserPolicy(
    private val authorizationService: AuthorizationService,
    private val acervoRepository: AcervoJpaRepository
) {
    fun requireCreate() {
        authorizationService.check("users.create")
    }

    fun requireUpdate() {
        authorizationService.check("users.update")
    }

    fun requireDelete() {
        authorizationService.check("users.delete")
    }

    fun requireBlock() {
        authorizationService.check("users.block")
    }

    /** Leitor com acervo: ator precisa acessar o contrato do acervo. Sem acervo: livre. */
    fun assertCanModify(user: UserEntity) {
        val acervoSchoolId = user.acervoId?.let { acervoId ->
            acervoRepository.findById(acervoId).orElse(null)?.schoolId
        }
        authorizationService.assertSameSchoolOrUnassigned(acervoSchoolId)
    }

    /**
     * Valida um acervo como destino de vinculo: existe, ativo, com contrato acessivel pelo ator.
     * Retorna a entidade para o chamador reutilizar.
     */
    fun requireLinkableAcervo(acervoId: Long): AcervoEntity {
        val acervo = acervoRepository.findById(acervoId.toAcervoId())
            .orElseThrow { BadRequestException("Acervo invalido") }
        if (!acervo.status) {
            throw BadRequestException("Acervo inativo nao pode ser vinculado")
        }
        val schoolId = acervo.schoolId
            ?: throw BadRequestException("Acervo sem contrato; vincule o acervo a um contrato antes")
        authorizationService.assertSameSchool(schoolId)
        return acervo
    }
}
