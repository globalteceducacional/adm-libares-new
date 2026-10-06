package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.BookEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface BookJpaRepository : JpaRepository<BookEntity, Long> {
    interface BookListProjection {
        fun getId(): Long
        fun getTitle(): String
        fun getAuthorId(): Long
        fun getAuthorName(): String?
        fun getBookCoverImage(): String?
        fun getStatus(): String
        fun getDescription(): String?
        fun getViews(): Number?
        fun getFeatured(): Number?
        fun getFileType(): String?
        fun getFileUrl(): String?
        fun getRateAvg(): String?
        fun getTotalRate(): Number?
        fun getCategoryId(): String?
        fun getSectionIds(): String?
    }

    @Query(
        value = """
            SELECT
                b.id                AS id,
                b.book_title        AS title,
                b.aid               AS authorId,
                a.author_name       AS authorName,
                b.book_cover_img    AS bookCoverImage,
                b.status            AS status,
                b.book_description  AS description,
                b.book_views        AS views,
                b.featured          AS featured,
                b.book_file_type    AS fileType,
                b.book_file_url     AS fileUrl,
                b.rate_avg          AS rateAvg,
                b.total_rate        AS totalRate,
                b.cat_id            AS categoryId,
                b.section_ids       AS sectionIds
            FROM tbl_books b
            LEFT JOIN tbl_author a ON a.author_id = b.aid
            WHERE b.status != '2'
            AND (
                :tenantSchoolId IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM livros_acervos la
                    INNER JOIN acervos ac ON ac.id = la.acervo_id
                    WHERE la.book_id = b.id
                      AND ac.school_id = :tenantSchoolId
                )
            )
            AND (
                :acervoId IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM livros_acervos la2
                    WHERE la2.book_id = b.id
                      AND la2.acervo_id = :acervoId
                )
            )
            ORDER BY b.id DESC
        """,
        countQuery = """
            SELECT COUNT(*)
            FROM tbl_books b
            WHERE b.status != '2'
            AND (
                :tenantSchoolId IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM livros_acervos la
                    INNER JOIN acervos ac ON ac.id = la.acervo_id
                    WHERE la.book_id = b.id
                      AND ac.school_id = :tenantSchoolId
                )
            )
            AND (
                :acervoId IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM livros_acervos la2
                    WHERE la2.book_id = b.id
                      AND la2.acervo_id = :acervoId
                )
            )
        """,
        nativeQuery = true
    )
    fun findPage(
        @Param("tenantSchoolId") tenantSchoolId: Long?,
        @Param("acervoId") acervoId: Long?,
        pageable: Pageable
    ): Page<BookListProjection>

    fun findByIdAndStatus(id: Long, status: String): BookEntity?
}
