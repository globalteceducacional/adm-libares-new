package com.libare.adm.modules.users.infrastructure.persistence.repository

import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository

interface UserJpaRepository : JpaRepository<UserEntity, Long> {
    fun findAllByStatus(status: String): List<UserEntity>
    fun findByIdAndStatus(id: Long, status: String): UserEntity?
}
