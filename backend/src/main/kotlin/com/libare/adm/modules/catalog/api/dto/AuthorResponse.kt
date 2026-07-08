package com.libare.adm.modules.catalog.api.dto

data class AuthorResponse(
    val id: Long,
    val name: String,
    val image: String?,
    val description: String?,
    val status: String
)
