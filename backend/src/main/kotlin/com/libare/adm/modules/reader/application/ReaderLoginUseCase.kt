package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReaderLoginUseCase(
    private val users: UserJpaRepository,
    private val passwords: ReaderPasswordService,
    private val urls: LegacyAssetUrlBuilder,
    private val activeLog: ReaderActiveLogService
) {
    @Transactional
    fun loginNormal(email: String, password: String): Map<String, Any> {
        val user = users.findByEmailIgnoreCaseAndUserTypeIgnoreCase(email.trim(), "Normal")
            ?: return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.EMAIL_NOT_FOUND, "success" to "0")
            )
        if (user.status != "1") {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.ACCOUNT_DEACTIVE, "success" to "0")
            )
        }
        if (user.isDeleted != 0) {
            return EbookAppEnvelope.arrayOne(userPayload(user, ReaderLang.USER_DELETED, "0"))
        }
        val verified = passwords.verifyAndDecideUpgrade(user.password, password)
        if (!verified.matches) {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.INVALID_PASSWORD, "success" to "0")
            )
        }
        if (verified.needsUpgrade) {
            users.save(copyWithPassword(user, passwords.encode(password)))
        }
        activeLog.touch(user.id)
        return EbookAppEnvelope.arrayOne(userPayload(user, ReaderLang.LOGIN_SUCCESS, "1"))
    }

    @Transactional
    fun loginSocial(email: String, authId: String, userType: String): Map<String, Any> {
        val trimmedEmail = email.trim()
        val user = if (authId.isBlank()) {
            users.findByEmailIgnoreCaseAndUserTypeIgnoreCase(trimmedEmail, userType)
        } else {
            users.findSocialCandidate(trimmedEmail, authId, userType)
        } ?: return EbookAppEnvelope.arrayOne(
            mapOf("MSG" to ReaderLang.EMAIL_NOT_FOUND, "success" to "0")
        )
        if (user.status == "0") {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.ACCOUNT_DEACTIVE, "success" to "0")
            )
        }
        if (user.isDeleted == 1) {
            return EbookAppEnvelope.arrayOne(
                mapOf(
                    "user_id" to user.id,
                    "name" to user.name,
                    "email" to user.email,
                    "MSG" to ReaderLang.USER_DELETED,
                    "auth_id" to authId,
                    "success" to "0"
                )
            )
        }
        if (authId.isNotBlank() && user.authId != authId) {
            users.save(copyWithAuthId(user, authId))
        }
        activeLog.touch(user.id)
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "user_id" to user.id,
                "name" to user.name,
                "email" to user.email,
                "MSG" to ReaderLang.LOGIN_SUCCESS,
                "auth_id" to authId,
                "success" to "1"
            )
        )
    }

    private fun userPayload(user: UserEntity, msg: String, success: String): Map<String, Any?> =
        mapOf(
            "user_id" to user.id,
            "name" to user.name,
            "user_image" to urls.images(user.userImage),
            "email" to user.email,
            "phone" to user.phone,
            "MSG" to msg,
            "auth_id" to "",
            "success" to success
        )

    private fun copyWithPassword(user: UserEntity, password: String): UserEntity =
        UserEntity(
            id = user.id,
            name = user.name,
            email = user.email,
            password = password,
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

    private fun copyWithAuthId(user: UserEntity, authId: String): UserEntity =
        UserEntity(
            id = user.id,
            name = user.name,
            email = user.email,
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
}
