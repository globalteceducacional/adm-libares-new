package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteUserUseCase(
    private val userRepository: UserJpaRepository,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(userId: Long) {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = userRepository.findByIdAndStatus(userId, "1")
            ?: throw NotFoundException("Usuario nao encontrado")

        userRepository.save(
            UserEntity(
                id = existing.id,
                name = existing.name,
                email = existing.email,
                phone = existing.phone,
                userType = existing.userType,
                userImage = existing.userImage,
                status = "0"
            )
        )
    }
}
