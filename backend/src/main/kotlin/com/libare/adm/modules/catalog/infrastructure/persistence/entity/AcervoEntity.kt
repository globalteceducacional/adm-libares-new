package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "acervos")
class AcervoEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(nullable = false, length = 100)
    val nome: String,

    @Column(columnDefinition = "TEXT")
    val descricao: String? = null,

    @Column(nullable = false)
    val status: Boolean = true,

    @Column(name = "school_id")
    val schoolId: Long? = null,

    @Column(name = "created_at", insertable = false, updatable = false)
    val createdAt: LocalDateTime? = null
)
