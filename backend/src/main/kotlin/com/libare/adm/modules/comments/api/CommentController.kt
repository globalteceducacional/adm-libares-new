package com.libare.adm.modules.comments.api

import com.libare.adm.modules.comments.api.dto.CommentResponse
import com.libare.adm.modules.comments.api.dto.UpdateCommentStatusRequest
import com.libare.adm.modules.comments.application.DeleteCommentUseCase
import com.libare.adm.modules.comments.application.ListCommentsUseCase
import com.libare.adm.modules.comments.application.UpdateCommentStatusUseCase
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/comments")
class CommentController(
    private val listCommentsUseCase: ListCommentsUseCase,
    private val updateCommentStatusUseCase: UpdateCommentStatusUseCase,
    private val deleteCommentUseCase: DeleteCommentUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<CommentResponse>> = ResponseEntity.ok(listCommentsUseCase.execute())

    @PutMapping("/{commentId}/status")
    fun updateStatus(
        @PathVariable commentId: Long,
        @Valid @RequestBody request: UpdateCommentStatusRequest
    ): ResponseEntity<CommentResponse> =
        ResponseEntity.ok(updateCommentStatusUseCase.execute(commentId, request))

    @DeleteMapping("/{commentId}")
    fun delete(@PathVariable commentId: Long): ResponseEntity<Void> {
        deleteCommentUseCase.execute(commentId)
        return ResponseEntity.noContent().build()
    }
}
