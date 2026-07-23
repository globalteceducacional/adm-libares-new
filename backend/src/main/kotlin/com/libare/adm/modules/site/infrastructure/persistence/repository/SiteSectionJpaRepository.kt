package com.libare.adm.modules.site.infrastructure.persistence.repository

import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteSectionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SiteSectionJpaRepository : JpaRepository<SiteSectionEntity, Int> {
    fun findAllByOrderByIdDesc(): List<SiteSectionEntity>
    fun existsByTitleIgnoreCase(title: String): Boolean
    fun existsByTitleIgnoreCaseAndIdNot(title: String, id: Int): Boolean
}
