package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import com.libare.adm.shared.persistence.StatusBooleanConverter
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table

@Entity
@Table(name = "catalog_books")
class BookEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "title", nullable = false, length = 255)
    val title: String,

    @Column(name = "author_id")
    val authorId: Long? = null,

    @Convert(converter = StatusBooleanConverter::class)
    @Column(name = "is_active", nullable = false)
    val status: String = "1",

    /** Coluna NOT NULL no core; derivada do titulo em @PrePersist/@PreUpdate. */
    @Column(name = "normalized_title", nullable = false, length = 255)
    var normalizedTitle: String = "",

    /** Nome do ficheiro em adm-libares/images (legado PHP). */
    @Column(name = "cover_image", length = 255)
    val bookCoverImage: String = "",
) {
    @PrePersist
    @PreUpdate
    fun syncNormalizedTitle() {
        normalizedTitle = title.trim().lowercase()
    }
}
