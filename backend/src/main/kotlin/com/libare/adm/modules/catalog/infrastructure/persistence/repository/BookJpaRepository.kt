package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface BookJpaRepository : JpaRepository<BookEntity, Long> {
    interface BookListProjection {
        fun getId(): Long
        fun getTitle(): String
        fun getAuthorId(): Long
        fun getAuthorName(): String?
        fun getBookCoverImage(): String?
        fun getStatus(): String
    }

    @Query(
        value = """
            SELECT 
                b.id AS id,
                b.book_title AS title,
                b.aid AS authorId,
                a.author_name AS authorName,
                b.book_cover_img AS bookCoverImage,
                b.status AS status
            FROM tbl_books b
            LEFT JOIN tbl_author a ON a.author_id = b.aid
            WHERE b.status = '1'
            ORDER BY b.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithAuthorName(): List<BookListProjection>

    fun findByIdAndStatus(id: Long, status: String): BookEntity?
}
