package com.libare.adm.modules.site.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "Autores_site")
class SiteAuthorEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "author_id")
    val id: Int = 0,

    @Column(name = "author_name", nullable = false, length = 255)
    val name: String,

    @Column(name = "author_image", nullable = false, length = 255)
    val image: String = "",

    @Column(name = "author_description", columnDefinition = "LONGTEXT")
    val description: String? = null,

    // Task 0: coluna legada a_status (INT no MySQL, espelha CategoryEntity.cat_status)
    @Column(name = "a_status", nullable = false)
    val status: Int = 1
)
