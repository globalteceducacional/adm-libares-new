package com.libare.adm.modules.schools.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "app_schools")
class SchoolEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 150)
    val name: String,

    @Column(nullable = false, length = 80, unique = true)
    val slug: String,

    @Column(nullable = false, length = 1)
    val status: String = "1",

    @Column(name = "created_at", insertable = false, updatable = false)
    val createdAt: LocalDateTime? = null,

    @Column(name = "updated_at", insertable = false, updatable = false)
    val updatedAt: LocalDateTime? = null
)
