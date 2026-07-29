package com.libare.adm.modules.site.infrastructure.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
// Nome entre backticks: sem as crases o naming strategy do Spring Boot converte para
// minusculas e a consulta falha em MySQL Linux, onde nomes de tabela sao case-sensitive.
@Table(name = "`Comentarios_site`")
class SiteCommentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    // Legado: book_id referencia Sites.id (nao tbl_books)
    @Column(name = "book_id", nullable = false)
    val bookId: Int,

    @Column(name = "user_id", nullable = false)
    val userId: Int = 0,

    @Column(name = "user_type", nullable = false, length = 255)
    val userType: String = "",

    @Column(name = "user_name", nullable = false, length = 255)
    val userName: String = "",

    @Column(name = "user_image", nullable = false, length = 255)
    val userImage: String = "",

    @Column(name = "user_email", nullable = false, length = 255)
    val userEmail: String = "",

    @Column(name = "comment_text", nullable = false, columnDefinition = "MEDIUMTEXT")
    val commentText: String,

    @Column(name = "dt_rate")
    val dtRate: Instant? = null,

    @Column(name = "comment_on", nullable = false, length = 255)
    val commentOn: String = ""
)
