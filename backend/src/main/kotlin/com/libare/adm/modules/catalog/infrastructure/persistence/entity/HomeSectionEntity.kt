package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "tbl_home_section")
class HomeSectionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(name = "section_title", nullable = false, length = 150)
    val title: String,

    @Column(name = "section_books", nullable = false, columnDefinition = "LONGTEXT")
    val sectionBooks: String = "",

    @Column(name = "status", nullable = false)
    val status: Int = 1
)
