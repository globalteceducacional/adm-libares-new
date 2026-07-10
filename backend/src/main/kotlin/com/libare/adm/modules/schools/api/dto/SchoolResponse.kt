package com.libare.adm.modules.schools.api.dto

data class SchoolResponse(
    val id: Long,
    val name: String,
    val slug: String,
    val status: String
)
