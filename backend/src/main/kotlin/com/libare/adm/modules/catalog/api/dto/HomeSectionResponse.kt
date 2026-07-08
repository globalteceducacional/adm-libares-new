package com.libare.adm.modules.catalog.api.dto

data class HomeSectionResponse(
    val id: Int,
    val title: String,
    val bookIds: List<Long>,
    val bookCount: Int,
    val status: String
)
