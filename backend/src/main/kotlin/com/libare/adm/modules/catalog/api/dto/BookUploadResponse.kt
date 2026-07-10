package com.libare.adm.modules.catalog.api.dto

data class BookCoverUploadResponse(
    val filename: String
)

data class BookFileUploadResponse(
    val filename: String,
    val fileUrl: String
)
