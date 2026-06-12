package com.libare.adm.modules.comments.application

import com.libare.adm.modules.comments.api.dto.CommentResponse
import com.libare.adm.modules.comments.infrastructure.persistence.repository.CommentQueryRepository
import org.springframework.stereotype.Service

@Service
class ListCommentsUseCase(
    private val commentQueryRepository: CommentQueryRepository
) {
    fun execute(): List<CommentResponse> =
        commentQueryRepository.findAllWithDetails()
            .map { comment ->
                CommentResponse(
                    id = comment.getId(),
                    bookId = comment.getBookId(),
                    bookTitle = comment.getBookTitle(),
                    userId = comment.getUserId(),
                    userName = comment.getUserName(),
                    commentText = comment.getCommentText(),
                    status = comment.getStatus(),
                    commentOn = comment.getCommentOn()
                )
            }
}
