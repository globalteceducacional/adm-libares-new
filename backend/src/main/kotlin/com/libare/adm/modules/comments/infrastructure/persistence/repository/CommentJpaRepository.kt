package com.libare.adm.modules.comments.infrastructure.persistence.repository

import com.libare.adm.modules.comments.infrastructure.persistence.entity.CommentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface CommentJpaRepository : JpaRepository<CommentEntity, Long> {
    fun findByIdAndStatus(id: Long, status: String): CommentEntity?
}
