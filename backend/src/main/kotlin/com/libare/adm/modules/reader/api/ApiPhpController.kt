package com.libare.adm.modules.reader.api

import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

/** Espelho de api.php — dispatcher por method_name. */
@RestController
class ApiPhpController(
    private val dispatcher: ApiPhpDispatcher
) {
    @RequestMapping(value = ["/api.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun dispatch(request: HttpServletRequest): Map<String, Any> {
        val params = request.parameterMap.mapValues { (_, v) -> v.firstOrNull().orEmpty() }
        val method = params["method_name"].orEmpty().ifBlank {
            params.keys.firstOrNull { it in ApiPhpDispatcher.KNOWN }.orEmpty()
        }.ifBlank {
            guessFlagMethod(params)
        }
        return dispatcher.dispatch(method, params)
    }

    private fun guessFlagMethod(params: Map<String, String>): String =
        ApiPhpDispatcher.KNOWN.firstOrNull { params.containsKey(it) && params[it] == "" }.orEmpty()
}
