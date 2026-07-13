package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AuthorEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface AuthorLookupRepository : JpaRepository<AuthorEntity, Long> {
    interface AuthorProjection {
        fun getId(): Long
        fun getName(): String
        fun getImage(): String?
    }

    @Query(
        value = """
            SELECT
                a.id AS id,
                a.name AS name,
                COALESCE(a.image_path, '') AS image
            FROM catalog_authors a
            WHERE a.deleted_at IS NULL
              AND a.is_active = TRUE
              AND a.author_type = 'BOOK'
            ORDER BY a.name ASC
        """,
        nativeQuery = true
    )
    fun findActiveAuthorOptions(): List<AuthorProjection>
}
