package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.UpdateUserStatusRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.policy.UserPolicy
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateUserStatusUseCase(
    private val userRepository: UserJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(userId: Long, request: UpdateUserStatusRequest): UserResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = userRepository.findById(userId)
            .orElseThrow { NotFoundException("Usuario nao encontrado") }

        if (request.status == "0") {
            userPolicy.requireBlock()
        } else {
            userPolicy.requireUpdate()
        }
        userPolicy.assertCanModify(existing)

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
                acervoId = existing.acervoId,
                schoolId = existing.schoolId,
                status = if (request.status == "0") "0" else "1"
            )
        )

        return userResponseMapper.fromEntity(updated)
    }
}
