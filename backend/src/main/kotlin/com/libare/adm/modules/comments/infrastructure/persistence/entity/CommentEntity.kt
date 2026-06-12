package com.libare.adm.modules.comments.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "tbl_comments")
class CommentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "book_id", nullable = false)
    val bookId: Long,

    @Column(name = "user_id")
    val userId: Long? = null,

    @Column(name = "user_name", length = 150)
    val userName: String? = null,

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    val commentText: String,

    @Column(name = "status", nullable = false, length = 1)
    val status: String = "1",

    @Column(name = "comment_on")
    val commentOn: String? = null
)
