package com.libare.adm.modules.site.infrastructure.persistence.repository

import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteCategoryEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SiteCategoryJpaRepository : JpaRepository<SiteCategoryEntity, Int> {
    fun findAllByOrderByIdDesc(): List<SiteCategoryEntity>
    fun existsByNameIgnoreCase(name: String): Boolean
    fun existsByNameIgnoreCaseAndIdNot(name: String, id: Int): Boolean
}
