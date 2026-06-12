package com.libare.adm.modules.auth.infrastructure.persistence.repository

import com.libare.adm.modules.auth.infrastructure.persistence.entity.AdminUserEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface AdminUserJpaRepository : JpaRepository<AdminUserEntity, Long> {
    fun findByUsername(username: String): Optional<AdminUserEntity>
}
