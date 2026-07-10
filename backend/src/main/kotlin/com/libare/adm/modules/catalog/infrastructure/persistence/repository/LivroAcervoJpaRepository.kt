package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.LivroAcervoEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface LivroAcervoJpaRepository : JpaRepository<LivroAcervoEntity, Int> {
    fun findByBookId(bookId: Long): List<LivroAcervoEntity>

    fun findByBookIdIn(bookIds: Collection<Long>): List<LivroAcervoEntity>

    @Modifying
    @Query("DELETE FROM LivroAcervoEntity la WHERE la.bookId = :bookId")
    fun deleteByBookId(bookId: Long)

    @Query(
        value = "SELECT book_id FROM livros_acervos WHERE acervo_id = :acervoId",
        nativeQuery = true
    )
    fun findBookIdsByAcervoId(acervoId: Long): List<Long>
}
