package com.libare.adm.modules.reader.api

import com.libare.adm.modules.reader.application.ReaderRegisterCommand
import com.libare.adm.modules.reader.application.ReaderRegisterUseCase
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class UserRegisterController(
    private val register: ReaderRegisterUseCase
) {
    @RequestMapping(value = ["/user_register_api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun register(
        @RequestParam(name = "type", required = false) type: String?,
        @RequestParam(required = false) email: String?,
        @RequestParam(required = false) password: String?,
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) phone: String?,
        @RequestParam(name = "auth_id", required = false) authId: String?,
        @RequestParam(name = "user_image", required = false) userImage: String?
    ): Map<String, Any> =
        register.register(
            ReaderRegisterCommand(
                type = type.orEmpty(),
                email = email.orEmpty(),
                password = password.orEmpty(),
                name = name.orEmpty(),
                phone = phone.orEmpty(),
                authId = authId.orEmpty(),
                userImage = userImage.orEmpty()
            )
        )
}
