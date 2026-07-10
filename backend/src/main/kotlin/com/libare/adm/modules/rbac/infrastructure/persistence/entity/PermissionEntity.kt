package com.libare.adm.modules.rbac.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "app_permissions")
class PermissionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 80, unique = true)
    val code: String,

    @Column(nullable = false, length = 50)
    val module: String,

    @Column(nullable = false, length = 255)
    val description: String
)
