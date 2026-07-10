package com.libare.adm.modules.schools.infrastructure.persistence.repository

import com.libare.adm.modules.schools.infrastructure.persistence.entity.SchoolEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SchoolJpaRepository : JpaRepository<SchoolEntity, Long> {
    fun findByStatusOrderByNameAsc(status: String): List<SchoolEntity>

    fun findAllByOrderByNameAsc(): List<SchoolEntity>

    fun existsBySlug(slug: String): Boolean

    fun existsBySlugAndIdNot(slug: String, id: Long): Boolean
}
