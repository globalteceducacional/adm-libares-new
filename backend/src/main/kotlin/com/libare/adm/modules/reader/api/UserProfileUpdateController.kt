package com.libare.adm.modules.reader.api

import com.libare.adm.modules.reader.application.ReaderProfileUseCases
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
class UserProfileUpdateController(
    private val profile: ReaderProfileUseCases
) {
    @RequestMapping(value = ["/user_profile_update_api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun update(
        @RequestParam(name = "user_id") userId: Long,
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) email: String?,
        @RequestParam(required = false) password: String?,
        @RequestParam(required = false) phone: String?,
        @RequestParam(name = "user_image", required = false) userImage: MultipartFile?
    ): Map<String, Any> =
        profile.updateProfile(userId, name, email, password, phone, userImage)
}
