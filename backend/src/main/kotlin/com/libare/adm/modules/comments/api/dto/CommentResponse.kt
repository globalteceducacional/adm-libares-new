package com.libare.adm.modules.comments.api.dto

data class CommentResponse(
    val id: Long,
    val bookId: Long,
    val bookTitle: String?,
    val userId: Long?,
    val userName: String?,
    val commentText: String,
    val status: String,
    val commentOn: String?
)
