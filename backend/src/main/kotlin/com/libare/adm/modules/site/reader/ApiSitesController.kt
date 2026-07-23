package com.libare.adm.modules.site.reader

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * Espelho publico de [api_sites.php] — GET/POST, envelope Galileu.
 */
@RestController
class ApiSitesController(
    private val dispatcher: ApiSitesDispatcher
) {
    @RequestMapping(value = ["/api_sites.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun dispatch(
        @RequestParam(name = "method_name", required = false) methodName: String?,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val method = methodName?.trim().orEmpty()
        val result = dispatcher.dispatch(method, request)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "application/json; charset=utf-8")
            .body(result)
    }
}
