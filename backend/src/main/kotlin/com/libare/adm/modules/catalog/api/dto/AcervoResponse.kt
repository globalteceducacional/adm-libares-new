package com.libare.adm.modules.catalog.api.dto

data class AcervoResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val status: String,
    val bookCount: Long,
    val userCount: Long,
    val schoolId: Long? = null,
    val schoolName: String? = null
)
