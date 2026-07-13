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
                b.title AS title,
                COALESCE(b.author_id, 0) AS authorId,
                a.name AS authorName,
                COALESCE(b.cover_image, '') AS bookCoverImage,
                CASE WHEN b.is_active THEN '1' ELSE '0' END AS status
            FROM catalog_books b
            LEFT JOIN catalog_authors a ON a.id = b.author_id AND a.deleted_at IS NULL
            WHERE b.deleted_at IS NULL
              AND b.is_active = TRUE
            ORDER BY b.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithAuthorName(): List<BookListProjection>

    fun findByIdAndStatus(id: Long, status: String): BookEntity?
}
