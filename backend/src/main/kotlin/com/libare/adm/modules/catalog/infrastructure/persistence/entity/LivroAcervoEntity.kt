package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "livros_acervos")
class LivroAcervoEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(name = "book_id", nullable = false)
    val bookId: Long,

    @Column(name = "acervo_id", nullable = false)
    val acervoId: Int
)
