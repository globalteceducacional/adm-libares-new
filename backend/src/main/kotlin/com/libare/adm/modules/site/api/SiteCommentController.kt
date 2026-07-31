package com.libare.adm.modules.site.api

import com.libare.adm.modules.site.api.dto.SiteCommentResponse
import com.libare.adm.modules.site.application.DeleteSiteCommentUseCase
import com.libare.adm.modules.site.application.ListSiteCommentsUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = OpenApiTags.SITE_COMMENTS,
    description = "Comentarios do modulo Site (Galileu) moderados pelo painel."
)
@RestController
@RequestMapping("/api/v1/site-comments")
class SiteCommentController(
    private val listSiteCommentsUseCase: ListSiteCommentsUseCase,
    private val deleteSiteCommentUseCase: DeleteSiteCommentUseCase
) {
    @Operation(
        summary = "Listar comentarios do site",
        description = "Lista comentarios publicados em conteudos do modulo Site."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de comentarios",
            content = [Content(schema = Schema(implementation = SiteCommentResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<SiteCommentResponse>> =
        ResponseEntity.ok(listSiteCommentsUseCase.execute())

    @Operation(
        summary = "Excluir comentario do site",
        description = "Remove permanentemente um comentario de conteudo do modulo Site."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Comentario excluido")
    )
    @DeleteMapping("/{id}")
    fun delete(
        @Parameter(description = "ID do comentario do site")
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        deleteSiteCommentUseCase.execute(id)
        return ResponseEntity.noContent().build()
    }
}
