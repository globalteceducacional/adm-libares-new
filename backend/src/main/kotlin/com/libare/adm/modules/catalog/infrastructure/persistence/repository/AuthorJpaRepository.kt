package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AuthorEntity
import org.springframework.data.jpa.repository.JpaRepository

interface AuthorJpaRepository : JpaRepository<AuthorEntity, Long> {
    fun findAllByOrderByIdDesc(): List<AuthorEntity>
    fun existsByNameIgnoreCase(name: String): Boolean
    fun existsByNameIgnoreCaseAndIdNot(name: String, id: Long): Boolean
}
