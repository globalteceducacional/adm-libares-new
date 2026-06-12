package com.libare.adm.modules.users.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "tbl_users")
class UserEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "name", nullable = false, length = 150)
    val name: String,

    @Column(name = "email", nullable = false, length = 190)
    val email: String,

    @Column(name = "phone", length = 40)
    val phone: String? = null,

    @Column(name = "user_type", nullable = false, length = 30)
    val userType: String = "Normal",

    @Column(name = "user_image", length = 255)
    val userImage: String? = null,

    @Column(name = "status", nullable = false, length = 1)
    val status: String = "1"
)
