package com.libare.adm.modules.site.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "Seções_site")
class SiteSectionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(name = "section_title", nullable = false, length = 150)
    val title: String,

    @Column(name = "section_books", nullable = false, columnDefinition = "LONGTEXT")
    val siteIdsCsv: String = "",

    @Column(name = "status", nullable = false)
    val status: Int = 1
)
