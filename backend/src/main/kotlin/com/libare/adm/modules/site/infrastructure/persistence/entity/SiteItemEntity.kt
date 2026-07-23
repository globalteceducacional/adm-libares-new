package com.libare.adm.modules.site.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "Sites")
class SiteItemEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(name = "cat_id", nullable = false, length = 250)
    val categoryIds: String,

    @Column(name = "aid", nullable = false)
    val authorId: Int,

    @Column(name = "book_title", nullable = false, length = 255)
    val title: String,

    @Column(name = "book_description", nullable = false, columnDefinition = "LONGTEXT")
    val description: String,

    @Column(name = "book_cover_img", nullable = false, length = 255)
    val coverImage: String,

    @Column(name = "book_file_type", nullable = false, length = 255)
    val fileType: String,

    @Column(name = "book_file_url", nullable = false, length = 255)
    val fileUrl: String,

    // Task 0/5: featured/status INT no MySQL (como SiteAuthorEntity.a_status)
    @Column(name = "featured", nullable = false)
    val featured: Int = 0,

    @Column(name = "status", nullable = false)
    val status: Int = 1,

    @Column(name = "total_rate", nullable = false)
    val totalRate: Int = 0,

    @Column(name = "rate_avg", nullable = false, length = 255)
    val rateAvg: String = "0",

    @Column(name = "book_views", nullable = false)
    val views: Int = 0
)
