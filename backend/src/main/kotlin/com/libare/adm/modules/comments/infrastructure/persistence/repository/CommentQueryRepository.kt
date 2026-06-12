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
                b.book_title AS bookTitle,
                c.user_id AS userId,
                COALESCE(u.name, c.user_name) AS userName,
                c.comment_text AS commentText,
                c.status AS status,
                c.comment_on AS commentOn
            FROM tbl_comments c
            LEFT JOIN tbl_books b ON b.id = c.book_id
            LEFT JOIN tbl_users u ON u.id = c.user_id
            WHERE c.status = '1'
            ORDER BY c.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithDetails(): List<CommentProjection>
}
