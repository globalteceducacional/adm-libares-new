package com.libare.adm.modules.catalog.api.dto

data class BookResponse(
    val id: Long,
    val title: String,
    val authorId: Long,
    val authorName: String?,
    val bookCoverImage: String?,
    val status: String
)
