package com.libare.adm.modules.reader.api

import com.libare.adm.modules.reader.application.ReaderProfileUseCases
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class UserProfileController(
    private val profile: ReaderProfileUseCases
) {
    @RequestMapping(value = ["/user_profile_api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun profile(@RequestParam(name = "id") id: Long): Map<String, Any> =
        profile.getProfile(id)
}
