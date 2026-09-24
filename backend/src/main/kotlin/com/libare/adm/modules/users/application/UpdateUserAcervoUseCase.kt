package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.UpdateUserAcervoRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.policy.UserPolicy
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Vincula ou desvincula (`acervoId = null`) o acervo do leitor (ADR 0006).
 * Quem pode agir: quem acessa o contrato do acervo atual (ou qualquer admin, se o leitor
 * ainda nao tem acervo). O acervo de destino precisa estar em contrato acessivel.
 */
@Service
class UpdateUserAcervoUseCase(
    private val userRepository: UserJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(userId: Long, request: UpdateUserAcervoRequest): UserResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        userPolicy.requireUpdate()

        val existing = userRepository.findById(userId)
            .orElseThrow { NotFoundException("Usuario nao encontrado") }
        userPolicy.assertCanModify(existing)

        val nextAcervoId = request.acervoId?.let { userPolicy.requireLinkableAcervo(it).id }

        val updated = userRepository.save(
            UserEntity(
                id = existing.id,
                name = existing.name,
                email = existing.email,
                password = existing.password,
                phone = existing.phone,
                userType = existing.userType,
                userImage = existing.userImage,
                authId = existing.authId,
                isDeleted = existing.isDeleted,
                registeredOn = existing.registeredOn,
                acervoId = nextAcervoId,
                status = existing.status
            )
        )

        return userResponseMapper.fromEntity(updated)
    }
}
