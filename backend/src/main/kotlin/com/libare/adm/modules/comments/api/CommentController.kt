package com.libare.adm.modules.comments.api

import com.libare.adm.modules.comments.api.dto.CommentResponse
import com.libare.adm.modules.comments.api.dto.UpdateCommentStatusRequest
import com.libare.adm.modules.comments.application.DeleteCommentUseCase
import com.libare.adm.modules.comments.application.ListCommentsUseCase
import com.libare.adm.modules.comments.application.UpdateCommentStatusUseCase
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
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = OpenApiTags.COMMENTS,
    description = "Moderacao de comentarios em livros do acervo (tbl_comments)."
)
@RestController
@RequestMapping("/api/v1/comments")
class CommentController(
    private val listCommentsUseCase: ListCommentsUseCase,
    private val updateCommentStatusUseCase: UpdateCommentStatusUseCase,
    private val deleteCommentUseCase: DeleteCommentUseCase
) {
    @Operation(
        summary = "Listar comentarios",
        description = "Lista comentarios de livros pendentes de moderacao ou ja publicados."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de comentarios",
            content = [Content(schema = Schema(implementation = CommentResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<CommentResponse>> = ResponseEntity.ok(listCommentsUseCase.execute())

    @Operation(
        summary = "Atualizar status do comentario",
        description = "Aprova (1) ou rejeita (0) um comentario para exibicao no app."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Status atualizado",
            content = [Content(schema = Schema(implementation = CommentResponse::class))]
        )
    )
    @PutMapping("/{commentId}/status")
    fun updateStatus(
        @Parameter(description = "ID do comentario")
        @PathVariable commentId: Long,
        @Valid @RequestBody request: UpdateCommentStatusRequest
    ): ResponseEntity<CommentResponse> =
        ResponseEntity.ok(updateCommentStatusUseCase.execute(commentId, request))

    @Operation(
        summary = "Excluir comentario",
        description = "Remove permanentemente um comentario do acervo."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Comentario excluido")
    )
    @DeleteMapping("/{commentId}")
    fun delete(
        @Parameter(description = "ID do comentario")
        @PathVariable commentId: Long
    ): ResponseEntity<Void> {
        deleteCommentUseCase.execute(commentId)
        return ResponseEntity.noContent().build()
    }
}
