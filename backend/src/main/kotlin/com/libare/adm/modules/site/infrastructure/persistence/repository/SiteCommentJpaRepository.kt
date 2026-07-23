package com.libare.adm.modules.site.infrastructure.persistence.repository

import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteCommentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SiteCommentJpaRepository : JpaRepository<SiteCommentEntity, Int> {
    fun findAllByOrderByIdDesc(): List<SiteCommentEntity>
}
