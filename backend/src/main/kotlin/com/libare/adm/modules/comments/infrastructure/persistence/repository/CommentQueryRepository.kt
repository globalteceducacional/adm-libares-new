package com.libare.adm.modules.comments.infrastructure.persistence.repository

import com.libare.adm.modules.comments.infrastructure.persistence.entity.CommentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface CommentQueryRepository : JpaRepository<CommentEntity, Long> {
    interface CommentProjection {
        fun getId(): Long
        fun getBookId(): Long
        fun getBookTitle(): String?
        fun getUserId(): Long?
        fun getUserName(): String?
        fun getCommentText(): String
        fun getStatus(): String
        fun getCommentOn(): String?
    }

    @Query(
        value = """
            SELECT
                c.id AS id,
                c.book_id AS bookId,
                b.title AS bookTitle,
                c.user_id AS userId,
                COALESCE(u.display_name, c.user_name) AS userName,
                c.comment_text AS commentText,
                CASE WHEN c.is_active THEN '1' ELSE '0' END AS status,
                CAST(c.commented_at_epoch AS TEXT) AS commentOn
            FROM engagement_comments c
            LEFT JOIN catalog_books b ON b.id = c.book_id AND b.deleted_at IS NULL
            LEFT JOIN app_users u ON u.id = c.user_id AND u.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
              AND c.is_active = TRUE
            ORDER BY c.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithDetails(): List<CommentProjection>
}
