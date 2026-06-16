package com.libare.adm.modules.comments.infrastructure.persistence.entity

import com.libare.adm.shared.persistence.EpochStringConverter
import com.libare.adm.shared.persistence.StatusBooleanConverter
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "engagement_comments")
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

    @Convert(converter = StatusBooleanConverter::class)
    @Column(name = "is_active", nullable = false)
    val status: String = "1",

    @Convert(converter = EpochStringConverter::class)
    @Column(name = "commented_at_epoch")
    val commentOn: String? = null,
)
