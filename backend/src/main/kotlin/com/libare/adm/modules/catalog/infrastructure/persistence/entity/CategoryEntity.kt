package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "tbl_category")
class CategoryEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cid")
    val id: Int = 0,

    @Column(name = "category_name", nullable = false, length = 50)
    val name: String,

    @Column(name = "category_image", nullable = false, length = 255)
    val image: String = "",

    @Column(name = "cat_status", nullable = false)
    val status: Int = 1
)
