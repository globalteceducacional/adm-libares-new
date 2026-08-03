package com.libare.adm.modules.reader.api

import com.libare.adm.modules.reader.application.ReaderLang
import com.libare.adm.modules.reader.application.ReaderLoginUseCase
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/** Espelho de user_login_api.php (Normal / Google / Facebook / Apple). */
@RestController
class UserLoginController(
    private val login: ReaderLoginUseCase
) {
    @RequestMapping(value = ["/user_login_api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun login(
        @RequestParam email: String?,
        @RequestParam password: String?,
        @RequestParam(name = "type") userType: String?,
        @RequestParam(name = "auth_id", required = false) authId: String?
    ): Map<String, Any> {
        val type = userType?.trim().orEmpty()
        return when {
            type.equals("normal", ignoreCase = true) ->
                login.loginNormal(email.orEmpty(), password.orEmpty())
            type.equals("google", ignoreCase = true) ->
                login.loginSocial(email.orEmpty(), authId.orEmpty(), "Google")
            type.equals("facebook", ignoreCase = true) ->
                login.loginSocial(email.orEmpty(), authId.orEmpty(), "Facebook")
            type.equals("apple", ignoreCase = true) ->
                login.loginSocial(email.orEmpty(), authId.orEmpty(), "Apple")
            else -> EbookAppEnvelope.arrayOne(
                mapOf("MSG" to ReaderLang.EMAIL_NOT_FOUND, "success" to "0")
            )
        }
    }
}
