package com.libare.adm.modules.catalog.infrastructure.persistence.repository

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.HomeSectionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface HomeSectionJpaRepository : JpaRepository<HomeSectionEntity, Int> {
    fun findAllByOrderByIdDesc(): List<HomeSectionEntity>
    fun findAllByStatusOrderByTitleAsc(status: Int): List<HomeSectionEntity>
    fun existsByTitleIgnoreCase(title: String): Boolean
    fun existsByTitleIgnoreCaseAndIdNot(title: String, id: Int): Boolean
}
