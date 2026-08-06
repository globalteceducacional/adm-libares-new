package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.UpdateUserProfileRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.policy.UserPolicy
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateUserProfileUseCase(
    private val userRepository: UserJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(userId: Long, request: UpdateUserProfileRequest): UserResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())
        userPolicy.requireUpdate()

        val existing = userRepository.findById(userId)
            .orElseThrow { NotFoundException("Usuario nao encontrado") }
        userPolicy.assertCanModify(existing)

        val email = request.email.trim()
        if (userRepository.countByEmailIgnoreCaseExcludingId(email, userId) > 0) {
            throw BadRequestException("Ja existe um usuario com este email")
        }

        val updated = userRepository.save(
            UserEntity(
                id = existing.id,
                name = request.name.trim(),
                email = email,
                password = existing.password,
                phone = request.phone.trim(),
                userType = existing.userType,
                userImage = existing.userImage,
                authId = existing.authId,
                isDeleted = existing.isDeleted,
                registeredOn = existing.registeredOn,
                acervoId = existing.acervoId,
                schoolId = existing.schoolId,
                status = existing.status
            )
        )
        return userResponseMapper.fromEntity(updated)
    }
}
