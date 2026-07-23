package com.libare.adm.modules.site.infrastructure.persistence.repository

import com.libare.adm.modules.site.infrastructure.persistence.entity.SiteAuthorEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SiteAuthorJpaRepository : JpaRepository<SiteAuthorEntity, Int> {
    fun findAllByOrderByIdDesc(): List<SiteAuthorEntity>
    fun existsByNameIgnoreCase(name: String): Boolean
    fun existsByNameIgnoreCaseAndIdNot(name: String, id: Int): Boolean
}
