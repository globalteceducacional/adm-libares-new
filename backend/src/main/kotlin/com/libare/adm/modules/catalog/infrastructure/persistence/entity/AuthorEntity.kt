package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "tbl_author")
class AuthorEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "author_id")
    val id: Long = 0,

    @Column(name = "author_name", nullable = false, length = 255)
    val name: String,

    @Column(name = "author_image", nullable = false, length = 255)
    val image: String = "",

    @Column(name = "author_description", columnDefinition = "LONGTEXT")
    val description: String? = null,

    @Column(name = "a_status", nullable = false)
    val status: String = "1"
)
