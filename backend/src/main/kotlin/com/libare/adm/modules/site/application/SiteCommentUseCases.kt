package com.libare.adm.modules.site.application

import com.libare.adm.modules.site.api.dto.SiteCommentResponse
import com.libare.adm.modules.site.application.policy.SiteCommentPolicy
import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteCommentEntity
import com.libare.adm.modules.site.infrastructure.persistence.repository.SiteCommentJpaRepository
import com.libare.adm.shared.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListSiteCommentsUseCase(
    private val repo: SiteCommentJpaRepository,
    private val siteCommentPolicy: SiteCommentPolicy
) {
    fun execute(): List<SiteCommentResponse> {
        siteCommentPolicy.requireView()
        return repo.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class DeleteSiteCommentUseCase(
    private val repo: SiteCommentJpaRepository,
    private val siteCommentPolicy: SiteCommentPolicy
) {
    @Transactional
    fun execute(commentId: Long) {
        siteCommentPolicy.requireModerate()
        if (!repo.existsById(commentId.toInt())) {
            throw NotFoundException("Comentario Site nao encontrado")
        }
        // Hard delete — PHP legado estava incompleto; completar com remocao real
        repo.deleteById(commentId.toInt())
    }
}

private fun toResponse(e: SiteCommentEntity) = SiteCommentResponse(
    id = e.id.toLong(),
    siteId = e.bookId.toLong(),
    bookId = e.bookId.toLong(),
    userId = e.userId.toLong(),
    userName = e.userName,
    userEmail = e.userEmail,
    userImage = e.userImage,
    userType = e.userType,
    commentText = e.commentText,
    dtRate = e.dtRate?.toString(),
    commentOn = e.commentOn
)
