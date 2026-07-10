package com.libare.adm.modules.rbac.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "app_roles")
class RoleEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "school_id")
    val schoolId: Long? = null,

    @Column(nullable = false, length = 100)
    val name: String,

    @Column(name = "is_system", nullable = false)
    val isSystem: Boolean = false,

    @Column(nullable = false, length = 1)
    val status: String = "1"
)
