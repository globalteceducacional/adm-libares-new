package com.libare.adm.modules.rbac.infrastructure.persistence.repository

import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PermissionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface PermissionJpaRepository : JpaRepository<PermissionEntity, Long> {
    fun findAllByOrderByModuleAscCodeAsc(): List<PermissionEntity>

    fun findByCodeIn(codes: Collection<String>): List<PermissionEntity>
}
