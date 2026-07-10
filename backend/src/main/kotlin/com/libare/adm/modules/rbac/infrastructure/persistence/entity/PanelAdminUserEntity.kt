package com.libare.adm.modules.rbac.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "app_admin_users")
class PanelAdminUserEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "school_id")
    val schoolId: Long? = null,

    @Column(nullable = false, length = 100, unique = true)
    val username: String,

    @Column(name = "password_hash", nullable = false, length = 255)
    val passwordHash: String,

    @Column(nullable = false, length = 150)
    val name: String,

    @Column(nullable = false, length = 1)
    val status: String = "1",

    @Column(name = "is_super_admin", nullable = false)
    val isSuperAdmin: Boolean = false,

    @Column(name = "perm_version", nullable = false)
    val permVersion: Int = 1,

    @Column(name = "created_at", insertable = false, updatable = false)
    val createdAt: LocalDateTime? = null,

    @Column(name = "updated_at", insertable = false, updatable = false)
    val updatedAt: LocalDateTime? = null
)
