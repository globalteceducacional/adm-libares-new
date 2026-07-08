package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.CategoryEntity
import org.springframework.data.jpa.repository.JpaRepository

interface CategoryJpaRepository : JpaRepository<CategoryEntity, Int> {
    fun findAllByOrderByIdDesc(): List<CategoryEntity>
    fun findAllByStatusOrderByNameAsc(status: Int): List<CategoryEntity>
    fun existsByNameIgnoreCase(name: String): Boolean
    fun existsByNameIgnoreCaseAndIdNot(name: String, id: Int): Boolean
}
