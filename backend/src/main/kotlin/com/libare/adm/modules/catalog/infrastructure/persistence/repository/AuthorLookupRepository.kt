package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AuthorEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.jpa.repository.JpaRepository

interface AuthorLookupRepository : JpaRepository<AuthorEntity, Long> {
    interface AuthorProjection {
        fun getId(): Long
        fun getName(): String
        fun getImage(): String?
    }

    @Query(
        value = """
            SELECT 
                a.author_id AS id,
                a.author_name AS name,
                a.author_image AS image
            FROM tbl_author a
            WHERE a.a_status = '1'
            ORDER BY a.author_name ASC
        """,
        nativeQuery = true
    )
    fun findActiveAuthorOptions(): List<AuthorProjection>
}
