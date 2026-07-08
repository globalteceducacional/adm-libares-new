package com.libare.adm.modules.users.infrastructure.persistence.repository

import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface UserJpaRepository : JpaRepository<UserEntity, Long> {
    interface UserListProjection {
        fun getId(): Long
        fun getName(): String
        fun getEmail(): String
        fun getPhone(): String?
        fun getUserType(): String
        fun getUserImage(): String?
        fun getStatus(): String
        fun getAcervoId(): Number?
        fun getAcervoName(): String?
    }

    fun findAllByStatus(status: String): List<UserEntity>

    fun findByIdAndStatus(id: Long, status: String): UserEntity?

    @Query(
        value = """
            SELECT COUNT(*)
            FROM tbl_users
            WHERE LOWER(email) = LOWER(:email)
              AND (is_deleted = 0 OR is_deleted IS NULL)
        """,
        nativeQuery = true
    )
    fun countByEmailIgnoreCase(@Param("email") email: String): Long

    @Query(
        value = """
            SELECT
                u.id AS id,
                u.name AS name,
                u.email AS email,
                u.phone AS phone,
                u.user_type AS userType,
                u.user_image AS userImage,
                u.status AS status,
                u.acervo_id AS acervoId,
                a.nome AS acervoName
            FROM tbl_users u
            LEFT JOIN acervos a ON a.id = u.acervo_id
            WHERE (:tenantSchoolId IS NULL OR u.school_id = :tenantSchoolId)
            ORDER BY u.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithAcervo(@Param("tenantSchoolId") tenantSchoolId: Long?): List<UserListProjection>

    @Query(
        value = """
            SELECT
                u.id AS id,
                u.name AS name,
                u.email AS email,
                u.phone AS phone,
                u.user_type AS userType,
                u.user_image AS userImage,
                u.status AS status,
                u.acervo_id AS acervoId,
                a.nome AS acervoName
            FROM tbl_users u
            LEFT JOIN acervos a ON a.id = u.acervo_id
            WHERE u.acervo_id = :acervoId
              AND (:tenantSchoolId IS NULL OR u.school_id = :tenantSchoolId)
            ORDER BY u.id DESC
        """,
        nativeQuery = true
    )
    fun findAllWithAcervoByAcervoId(
        @Param("acervoId") acervoId: Long,
        @Param("tenantSchoolId") tenantSchoolId: Long?
    ): List<UserListProjection>
}
