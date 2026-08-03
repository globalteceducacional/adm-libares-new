package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

data class ReaderRegisterCommand(
    val type: String,
    val email: String,
    val password: String,
    val name: String,
    val phone: String,
    val authId: String,
    val userImage: String
)

@Service
class ReaderRegisterUseCase(
    private val users: UserJpaRepository,
    private val passwords: ReaderPasswordService,
    private val activeLog: ReaderActiveLogService
) {
    @Transactional
    fun register(cmd: ReaderRegisterCommand): Map<String, Any> {
        val type = cmd.type.trim()
        return when {
            type.equals("google", ignoreCase = true) -> registerSocial(cmd, "Google")
            type.equals("facebook", ignoreCase = true) -> registerSocial(cmd, "Facebook")
            type.equals("apple", ignoreCase = true) -> registerApple(cmd)
            else -> registerNormal(cmd)
        }
    }

    private fun registerNormal(cmd: ReaderRegisterCommand): Map<String, Any> {
        val email = cmd.email.trim()
        if (!isValidEmail(email)) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to ReaderLang.INVALID_EMAIL, "success" to "0")
            )
        }
        if (users.countByEmailIgnoreCase(email) > 0) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to ReaderLang.EMAIL_ALREADY_USED, "success" to "0")
            )
        }
        val saved = users.save(
            UserEntity(
                name = cmd.name.trim().ifBlank { email },
                email = email,
                password = passwords.encode(cmd.password),
                phone = cmd.phone.trim(),
                userType = "Normal",
                userImage = "",
                authId = "",
                isDeleted = 0,
                registeredOn = epochSeconds(),
                status = "1"
            )
        )
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "msg" to ReaderLang.REGISTER_SUCCESS,
                "success" to "1",
                "user_id" to saved.id.toString()
            )
        )
    }

    private fun registerSocial(cmd: ReaderRegisterCommand, userType: String): Map<String, Any> {
        val email = cmd.email.trim()
        val authId = cmd.authId.trim()
        val existing = if (authId.isBlank()) {
            users.findByEmailIgnoreCaseAndUserTypeIgnoreCase(email, userType)
        } else {
            users.findSocialCandidate(email, authId, userType)
        }
        if (existing == null) {
            val saved = users.save(
                UserEntity(
                    name = cmd.name.trim().ifBlank { email },
                    email = email,
                    password = cmd.password.ifBlank { "" }.let {
                        if (it.isBlank()) "" else passwords.encode(it)
                    },
                    phone = cmd.phone.trim(),
                    userType = userType,
                    userImage = cmd.userImage.trim(),
                    authId = authId,
                    isDeleted = 0,
                    registeredOn = epochSeconds(),
                    status = "1"
                )
            )
            activeLog.touch(saved.id)
            return EbookAppEnvelope.arrayOne(
                mapOf(
                    "user_id" to saved.id.toString(),
                    "name" to saved.name,
                    "email" to saved.email,
                    "user_image" to saved.userImage,
                    "success" to "1",
                    "MSG" to ReaderLang.REGISTER_SUCCESS,
                    "auth_id" to authId
                )
            )
        }
        if (authId.isNotBlank() && existing.authId != authId) {
            users.save(copyUser(existing, authId = authId))
        }
        activeLog.touch(existing.id)
        if (existing.status == "0") {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to "account_deactive", "success" to "0")
            )
        }
        if (existing.isDeleted == 1) {
            return EbookAppEnvelope.arrayOne(
                mapOf(
                    "user_id" to existing.id,
                    "name" to existing.name,
                    "email" to existing.email,
                    "MSG" to ReaderLang.USER_DELETED,
                    "auth_id" to authId,
                    "success" to "0"
                )
            )
        }
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "user_id" to existing.id,
                "name" to existing.name,
                "email" to existing.email,
                "MSG" to ReaderLang.LOGIN_SOCIAL_OK,
                "auth_id" to authId,
                "success" to "1"
            )
        )
    }

    private fun registerApple(cmd: ReaderRegisterCommand): Map<String, Any> {
        val authId = cmd.authId.trim()
        val existing = users.findByAuthIdAndUserTypeIgnoreCase(authId, "Apple")
        if (existing == null) {
            val saved = users.save(
                UserEntity(
                    name = cmd.name.trim().ifBlank { cmd.email.trim() },
                    email = cmd.email.trim(),
                    password = "",
                    phone = cmd.phone.trim(),
                    userType = "Apple",
                    userImage = "",
                    authId = authId,
                    isDeleted = 0,
                    registeredOn = epochSeconds(),
                    status = "1"
                )
            )
            activeLog.touch(saved.id)
            return EbookAppEnvelope.arrayOne(
                mapOf(
                    "user_id" to saved.id.toString(),
                    "name" to saved.name,
                    "email" to saved.email,
                    "success" to "1",
                    "MSG" to ReaderLang.REGISTER_SUCCESS,
                    "auth_id" to authId
                )
            )
        }
        val name = cmd.name.trim().ifBlank { existing.name }
        val email = cmd.email.trim().ifBlank { existing.email }
        users.save(copyUser(existing, name = name, email = email, authId = authId))
        activeLog.touch(existing.id)
        if (existing.status == "0") {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.ACCOUNT_DEACTIVE, "success" to "0")
            )
        }
        if (existing.isDeleted == 1) {
            return EbookAppEnvelope.arrayOne(
                mapOf(
                    "user_id" to existing.id,
                    "name" to existing.name,
                    "email" to existing.email,
                    "MSG" to ReaderLang.USER_DELETED,
                    "auth_id" to authId,
                    "success" to "0"
                )
            )
        }
        val refreshed = users.findByAuthIdAndUserTypeIgnoreCase(authId, "Apple") ?: existing
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "user_id" to refreshed.id,
                "name" to refreshed.name,
                "email" to refreshed.email,
                "MSG" to ReaderLang.LOGIN_SUCCESS,
                "auth_id" to authId,
                "success" to "1"
            )
        )
    }

    private fun isValidEmail(email: String): Boolean =
        email.isNotBlank() && EMAIL_REGEX.matches(email)

    private fun epochSeconds(): String = (System.currentTimeMillis() / 1000L).toString()

    private fun copyUser(
        user: UserEntity,
        name: String = user.name,
        email: String = user.email,
        authId: String = user.authId
    ): UserEntity =
        UserEntity(
            id = user.id,
            name = name,
            email = email,
            password = user.password,
            phone = user.phone,
            userType = user.userType,
            userImage = user.userImage,
            authId = authId,
            isDeleted = user.isDeleted,
            registeredOn = user.registeredOn,
            acervoId = user.acervoId,
            schoolId = user.schoolId,
            status = user.status
        )

    companion object {
        private val EMAIL_REGEX = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    }
}
