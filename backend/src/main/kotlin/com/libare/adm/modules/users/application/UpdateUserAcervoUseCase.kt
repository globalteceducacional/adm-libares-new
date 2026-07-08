package com.libare.adm.modules.users.application

import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.users.api.dto.UpdateUserAcervoRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.policy.UserPolicy
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.security.CurrentActorResolver
import com.libare.adm.shared.util.toAcervoId
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateUserAcervoUseCase(
    private val userRepository: UserJpaRepository,
    private val acervoRepository: AcervoJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val authorizationService: AuthorizationService,
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

        val acervo = acervoRepository.findById(request.acervoId.toAcervoId())
            .orElseThrow { BadRequestException("Acervo nao encontrado") }
        if (!acervo.status) {
            throw BadRequestException("Acervo inativo nao pode ser vinculado ao usuario")
        }
        authorizationService.assertSameSchool(acervo.schoolId)

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
                acervoId = request.acervoId.toAcervoId(),
                schoolId = acervo.schoolId,
                status = existing.status
            )
        )

        return userResponseMapper.fromEntity(updated)
    }
}
