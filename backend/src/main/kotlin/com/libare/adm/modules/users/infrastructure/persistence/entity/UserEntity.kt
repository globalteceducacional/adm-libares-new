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

    @Column(name = "password", nullable = false, length = 255)
    val password: String = "",

    @Column(name = "phone", length = 40)
    val phone: String? = null,

    @Column(name = "user_type", nullable = false, length = 30)
    val userType: String = "Normal",

    @Column(name = "user_image", length = 255)
    val userImage: String? = null,

    @Column(name = "auth_id", nullable = false, length = 255)
    val authId: String = "",

    @Column(name = "is_deleted", nullable = false)
    val isDeleted: Int = 0,

    @Column(name = "registered_on", nullable = false, length = 200)
    val registeredOn: String = "",

    @Column(name = "acervo_id")
    val acervoId: Int? = null,

    @Column(name = "school_id")
    val schoolId: Long? = null,

    @Column(name = "status", nullable = false, length = 1)
    val status: String = "1"
)
