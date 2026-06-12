package com.libare.adm.modules.comments.application

import com.libare.adm.modules.comments.api.dto.CommentResponse
import com.libare.adm.modules.comments.api.dto.UpdateCommentStatusRequest
import com.libare.adm.modules.comments.infrastructure.persistence.entity.CommentEntity
import com.libare.adm.modules.comments.infrastructure.persistence.repository.CommentJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateCommentStatusUseCase(
    private val commentRepository: CommentJpaRepository,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(commentId: Long, request: UpdateCommentStatusRequest): CommentResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = commentRepository.findByIdAndStatus(commentId, "1")
            ?: throw NotFoundException("Comentario nao encontrado")

        val updated = commentRepository.save(
            CommentEntity(
                id = existing.id,
                bookId = existing.bookId,
                userId = existing.userId,
                userName = existing.userName,
                commentText = existing.commentText,
                status = if (request.status == "0") "0" else "1",
                commentOn = existing.commentOn
            )
        )

        return CommentResponse(
            id = updated.id,
            bookId = updated.bookId,
            bookTitle = null,
            userId = updated.userId,
            userName = updated.userName,
            commentText = updated.commentText,
            status = updated.status,
            commentOn = updated.commentOn
        )
    }
}
