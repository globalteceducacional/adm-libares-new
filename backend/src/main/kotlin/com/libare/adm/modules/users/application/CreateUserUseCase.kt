package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.CreateUserRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.policy.UserPolicy
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import com.libare.adm.shared.util.toAcervoId
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateUserUseCase(
    private val userRepository: UserJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(request: CreateUserRequest): UserResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        userPolicy.requireCreate()

        val email = request.email.trim()
        if (userRepository.countByEmailIgnoreCase(email) > 0) {
            throw BadRequestException("Ja existe um usuario com este email")
        }

        // Acervo informado precisa existir, estar ativo e pertencer a um contrato acessivel.
        val acervoId = request.acervoId?.let { userPolicy.requireLinkableAcervo(it).id }

        val registeredOn = (System.currentTimeMillis() / 1000).toString()
        val saved = userRepository.save(
            UserEntity(
                name = request.name.trim(),
                email = email,
                password = request.password,
                phone = request.phone.trim(),
                userType = "Normal",
                userImage = request.userImage?.trim()?.ifBlank { "" } ?: "",
                authId = "",
                isDeleted = 0,
                registeredOn = registeredOn,
                acervoId = acervoId,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )

        return userResponseMapper.fromEntity(saved)
    }
}
