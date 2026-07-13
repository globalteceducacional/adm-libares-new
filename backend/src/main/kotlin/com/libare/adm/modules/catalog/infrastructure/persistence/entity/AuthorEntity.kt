package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import com.libare.adm.shared.persistence.StatusBooleanConverter
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "catalog_authors")
class AuthorEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "name", nullable = false, length = 150)
    val name: String,

    @Convert(converter = StatusBooleanConverter::class)
    @Column(name = "is_active", nullable = false)
    val status: String = "1",

    /** Nome do ficheiro em adm-libares/images (legado PHP). */
    @Column(name = "image_path", length = 255)
    val image: String = "",
)
