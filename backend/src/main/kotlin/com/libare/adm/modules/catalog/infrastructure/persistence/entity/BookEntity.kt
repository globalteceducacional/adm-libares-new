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

    @Column(name = "cat_id", nullable = false, length = 250)
    val categoryIds: String,

    @Column(name = "section_ids", columnDefinition = "TEXT")
    val sectionIds: String? = null,

    @Column(name = "aid", nullable = false)
    val authorId: Long,

    @Column(name = "featured", nullable = false)
    val featured: Int = 0,

    @Column(name = "book_title", nullable = false, length = 100)
    val title: String,

    @Column(name = "book_description", nullable = false, columnDefinition = "LONGTEXT")
    val description: String,

    @Column(name = "book_cover_img", nullable = false, length = 255)
    val bookCoverImage: String,

    @Column(name = "book_file_type", nullable = false, length = 255)
    val fileType: String,

    @Column(name = "book_file_url", nullable = false, length = 255)
    val fileUrl: String,

    @Column(name = "total_rate", nullable = false)
    val totalRate: Int = 0,

    @Column(name = "rate_avg", nullable = false, length = 255)
    val rateAvg: String = "0",

    @Column(name = "book_views", nullable = false)
    val bookViews: Int = 0,

    @Column(name = "status", nullable = false, length = 1)
    val status: String = "1"
)
