package com.libare.adm.modules.site.reader

import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
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
@Tag(
    name = OpenApiTags.READER_SITE,
    description = "API publica do leitor Site (Galileu), espelhando o dispatcher PHP legado api_sites.php. " +
        "Respostas usam envelope JSON com chave raiz Galileu (nao EBOOK_APP). Endpoint publico, sem JWT. " +
        "Parametros extras variam por method_name. Contrato completo em /v3/api-docs/leitor."
)
@RestController
class ApiSitesController(
    private val dispatcher: ApiSitesDispatcher
) {
    @Operation(
        summary = "Dispatcher api_sites.php (espelho PHP)",
        description = "Roteador unico que replica o api_sites.php legado. Aceita GET ou POST com method_name " +
            "e parametros extras (cat_id, book_id, etc.). Metodos: home, cat_list, cat_id, author_list, " +
            "author_id, latest, allbook, search_text, book_id, home_section, home_section_id, get_all_comments, " +
            "removecomment, rating_check, continue_reading, con_reding_book, removeuser, delete_userdata, app_details. " +
            "Resposta JSON UTF-8 com envelope Galileu.",
        security = []
    )
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Envelope Galileu com dados ou mensagem de sucesso/erro",
            content = [Content(schema = Schema(type = "object", additionalProperties = Schema.AdditionalPropertiesValue.TRUE))]
        )
    )
    @RequestMapping(value = ["/api_sites.php"], method = [RequestMethod.GET, RequestMethod.POST])
    fun dispatch(
        @Parameter(
            description = "Nome do metodo PHP legado a invocar",
            example = "home",
            schema = Schema(
                type = "string",
                allowableValues = [
                    "home", "cat_list", "cat_id", "author_list", "author_id", "latest", "allbook",
                    "search_text", "book_id", "home_section", "home_section_id", "get_all_comments",
                    "removecomment", "rating_check", "continue_reading", "con_reding_book",
                    "removeuser", "delete_userdata", "app_details"
                ]
            )
        )
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
