package com.libare.adm.modules.catalog.api.dto

data class CategoryResponse(
    val id: Int,
    val name: String,
    val image: String?,
    val status: String
)
