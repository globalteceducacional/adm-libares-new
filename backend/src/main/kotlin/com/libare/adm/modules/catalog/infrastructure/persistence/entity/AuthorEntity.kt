package com.libare.adm.modules.catalog.infrastructure.persistence.entity

import com.libare.adm.shared.persistence.StatusBooleanConverter
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Transient

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

    /** Campo legado sem coluna no core; retorna vazio para manter o contrato da API. */
    @get:Transient
    val image: String = "",
)
