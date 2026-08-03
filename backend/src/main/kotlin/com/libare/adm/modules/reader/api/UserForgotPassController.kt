package com.libare.adm.modules.reader.api

import com.libare.adm.modules.reader.application.ReaderForgotPasswordUseCase
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class UserForgotPassController(
    private val forgot: ReaderForgotPasswordUseCase
) {
    @RequestMapping(value = ["/user_forgot_pass_api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun forgot(@RequestParam email: String?): Map<String, Any> =
        forgot.forgot(email.orEmpty())
}
