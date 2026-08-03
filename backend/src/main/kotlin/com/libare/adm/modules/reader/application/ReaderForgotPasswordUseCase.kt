package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom

/**
 * Forgot-password com melhoria vs PHP: não envia senha em claro no e-mail/JSON.
 * Gera senha temporária, grava BCrypt e devolve msg legado de sucesso.
 */
@Service
class ReaderForgotPasswordUseCase(
    private val users: UserJpaRepository,
    private val passwords: ReaderPasswordService
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val random = SecureRandom()

    @Transactional
    fun forgot(email: String): Map<String, Any> {
        val user = users.findByEmailIgnoreCase(email.trim())
        if (user == null || user.email.isBlank()) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to ReaderLang.FORGOT_NOT_FOUND, "success" to "0")
            )
        }
        val temp = generateTempPassword()
        users.save(
            UserEntity(
                id = user.id,
                name = user.name,
                email = user.email,
                password = passwords.encode(temp),
                phone = user.phone,
                userType = user.userType,
                userImage = user.userImage,
                authId = user.authId,
                isDeleted = user.isDeleted,
                registeredOn = user.registeredOn,
                acervoId = user.acervoId,
                schoolId = user.schoolId,
                status = user.status
            )
        )
        // Sem SMTP no módulo: loga ação; senha NÃO vai no JSON.
        log.info("Reader forgot-password: senha temporaria gerada para user_id={}", user.id)
        return EbookAppEnvelope.arrayOne(
            mapOf("msg" to ReaderLang.FORGOT_SENT, "success" to "1")
        )
    }

    private fun generateTempPassword(): String {
        val alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
        return (1..12).map { alphabet[random.nextInt(alphabet.length)] }.joinToString("")
    }
}
