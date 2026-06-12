package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "tbl_books")
class BookEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "book_title", nullable = false, length = 255)
    val title: String,

    @Column(name = "aid", nullable = false)
    val authorId: Long,

    @Column(name = "book_cover_img", nullable = false, length = 255)
    val bookCoverImage: String = "",

    @Column(name = "status", nullable = false)
    val status: String = "1"
)
