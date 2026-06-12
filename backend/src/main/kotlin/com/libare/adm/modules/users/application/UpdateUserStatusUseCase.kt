package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.UpdateUserStatusRequest
import com.libare.adm.modules.users.api.dto.UserResponse
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
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(userId: Long, request: UpdateUserStatusRequest): UserResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = userRepository.findByIdAndStatus(userId, "1")
            ?: throw NotFoundException("Usuario nao encontrado")

        val updated = userRepository.save(
            UserEntity(
                id = existing.id,
                name = existing.name,
                email = existing.email,
                phone = existing.phone,
                userType = existing.userType,
                userImage = existing.userImage,
                status = if (request.status == "0") "0" else "1"
            )
        )

        return UserResponse(
            id = updated.id,
            name = updated.name,
            email = updated.email,
            phone = updated.phone,
            userType = updated.userType,
            userImage = updated.userImage,
            status = updated.status
        )
    }
}
