package com.libare.adm.modules.site.infrastructure.persistence.repository

import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteItemEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SiteItemJpaRepository : JpaRepository<SiteItemEntity, Int> {
    fun findAllByOrderByIdDesc(): List<SiteItemEntity>
}
