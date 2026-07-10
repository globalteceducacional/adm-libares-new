package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AcervoEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface AcervoJpaRepository : JpaRepository<AcervoEntity, Int> {
    interface AcervoListProjection {
        fun getId(): Long
        fun getNome(): String
        fun getDescricao(): String?
        fun getStatus(): Boolean
        fun getBookCount(): Number
        fun getUserCount(): Number
    }

    fun existsByNomeIgnoreCase(nome: String): Boolean

    fun existsByNomeIgnoreCaseAndIdNot(nome: String, id: Int): Boolean

    fun existsByNomeIgnoreCaseAndSchoolId(nome: String, schoolId: Long): Boolean

    fun existsByNomeIgnoreCaseAndSchoolIdAndIdNot(nome: String, schoolId: Long, id: Int): Boolean

    @Query(
        value = """
            SELECT
                a.id AS id,
                a.nome AS nome,
                a.descricao AS descricao,
                a.status AS status,
                COUNT(DISTINCT la.book_id) AS bookCount,
                COUNT(DISTINCT u.id) AS userCount
            FROM acervos a
            LEFT JOIN livros_acervos la ON la.acervo_id = a.id
            LEFT JOIN tbl_users u ON u.acervo_id = a.id
            WHERE (:tenantSchoolId IS NULL OR a.school_id = :tenantSchoolId)
            GROUP BY a.id, a.nome, a.descricao, a.status, a.created_at, a.school_id
            ORDER BY a.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithStats(@Param("tenantSchoolId") tenantSchoolId: Long?): List<AcervoListProjection>

    @Query(
        value = """
            SELECT a.id AS id, a.nome AS nome
            FROM acervos a
            WHERE a.status = 1
              AND (:tenantSchoolId IS NULL OR a.school_id = :tenantSchoolId)
            ORDER BY a.nome ASC
        """,
        nativeQuery = true
    )
    fun findActiveOptions(@Param("tenantSchoolId") tenantSchoolId: Long?): List<AcervoOptionProjection>

    interface AcervoOptionProjection {
        fun getId(): Long
        fun getNome(): String
    }
}
