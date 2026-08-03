package com.libare.adm.modules.reader.application

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.reader.api.EbookAppEnvelope
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class ReaderProfileUseCases(
    private val users: UserJpaRepository,
    private val passwords: ReaderPasswordService,
    private val urls: LegacyAssetUrlBuilder,
    private val assetStorage: LegacyBookAssetStorage
) {
    fun getProfile(userId: Long): Map<String, Any> {
        val user = users.findById(userId).orElse(null)
            ?: return EbookAppEnvelope.arrayOne(
                mapOf("success" to "0", "msg" to ReaderLang.EMAIL_NOT_FOUND)
            )
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "user_id" to user.id,
                "name" to user.name,
                "user_image" to resolveImage(user),
                "email" to user.email,
                "phone" to user.phone,
                "success" to "1"
            )
        )
    }

    @Transactional
    fun updateProfile(
        userId: Long,
        name: String?,
        email: String?,
        password: String?,
        phone: String?,
        userImage: MultipartFile?
    ): Map<String, Any> {
        val user = users.findById(userId).orElse(null)
            ?: return EbookAppEnvelope.arrayOne(
                mapOf("msg" to ReaderLang.EMAIL_NOT_FOUND, "success" to "0")
            )
        val newEmail = email?.trim().orEmpty().ifBlank { user.email }
        if (newEmail != user.email) {
            val conflict = users.findByEmailIgnoreCase(newEmail)
            if (conflict != null && conflict.id != user.id) {
                return EbookAppEnvelope.arrayOne(
                    mapOf("msg" to ReaderLang.EMAIL_ALREADY_USED, "success" to "0")
                )
            }
        }
        val newPassword = if (!password.isNullOrBlank()) {
            passwords.encode(password)
        } else {
            user.password
        }
        val newImage = if (userImage != null && !userImage.isEmpty) {
            assetStorage.storeCatalogImage(userImage)
        } else {
            user.userImage.orEmpty()
        }
        users.save(
            UserEntity(
                id = user.id,
                name = name?.trim().orEmpty().ifBlank { user.name },
                email = newEmail,
                password = newPassword,
                phone = phone?.trim() ?: user.phone,
                userType = user.userType,
                userImage = newImage,
                authId = user.authId,
                isDeleted = user.isDeleted,
                registeredOn = user.registeredOn,
                acervoId = user.acervoId,
                schoolId = user.schoolId,
                status = user.status
            )
        )
        return EbookAppEnvelope.arrayOne(
            mapOf("msg" to ReaderLang.PROFILE_UPDATED, "success" to "1")
        )
    }

    private fun resolveImage(user: UserEntity): String {
        val image = user.userImage
        if (image.isNullOrBlank()) {
            return urls.images(null)
        }
        val type = user.userType
        if (type.equals("Google", ignoreCase = true) || type.equals("Facebook", ignoreCase = true)) {
            if (image.startsWith("http://") || image.startsWith("https://")) {
                return image
            }
        }
        return urls.images(image)
    }
}
