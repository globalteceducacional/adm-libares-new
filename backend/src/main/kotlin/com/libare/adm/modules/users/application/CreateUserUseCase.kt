package com.libare.adm.modules.users.application

import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.users.api.dto.CreateUserRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.policy.UserPolicy
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import com.libare.adm.shared.tenant.TenantContext
import com.libare.adm.shared.util.toAcervoId
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Cria usuario do app ([tbl_users]).
 * Acervo e escola sao opcionais: sem acervo o leitor fica sem vinculo
 * e pode receber acervo/escola depois via [UpdateUserAcervoUseCase].
 *
 * **Gap conhecido de login do leitor:** o PHP legado `adm-libares/user_login_api.php`
 * ainda compara `$row['password'] == $password` (plaintext). Hashes BCrypt gravados
 * aqui **nao** autenticam nessa API ate o PHP passar a usar `password_verify`.
 * Mantemos [PasswordEncoder] (BCrypt) conforme o plano do painel — nao armazenar plaintext.
 */
@Service
class CreateUserUseCase(
    private val userRepository: UserJpaRepository,
    private val acervoRepository: AcervoJpaRepository,
    private val userResponseMapper: UserResponseMapper,
    private val userPolicy: UserPolicy,
    private val passwordEncoder: PasswordEncoder,
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

        val acervoId = request.acervoId
        val (resolvedAcervoId, schoolId) = if (acervoId != null) {
            val acervo = acervoRepository.findById(acervoId.toAcervoId())
                .orElseThrow { BadRequestException("Acervo invalido") }
            if (!acervo.status) {
                throw BadRequestException("Acervo inativo")
            }
            acervoId.toAcervoId() to resolveSchoolId(acervo.schoolId)
        } else {
            null to null
        }

        val registeredOn = (System.currentTimeMillis() / 1000).toString()
        val saved = userRepository.save(
            UserEntity(
                name = request.name.trim(),
                email = email,
                password = passwordEncoder.encode(request.password),
                phone = request.phone.trim(),
                userType = "Normal",
                userImage = request.userImage?.trim()?.ifBlank { "" } ?: "",
                authId = "",
                isDeleted = 0,
                registeredOn = registeredOn,
                acervoId = resolvedAcervoId,
                schoolId = schoolId,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )

        return userResponseMapper.fromEntity(saved)
    }

    private fun resolveSchoolId(acervoSchoolId: Long?): Long? {
        val principal = TenantContext.get()
        val contextSchoolId = principal.effectiveSchoolId()

        if (contextSchoolId != null) {
            if (acervoSchoolId != null && acervoSchoolId != contextSchoolId) {
                throw ForbiddenException("Acervo nao pertence a escola do contexto")
            }
            return contextSchoolId
        }

        if (acervoSchoolId == null) {
            return null
        }
        if (!principal.canAccessSchool(acervoSchoolId)) {
            throw ForbiddenException("Sem acesso a escola do acervo selecionado")
        }
        return acervoSchoolId
    }
}
