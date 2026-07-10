package com.libare.adm.modules.catalog.api.dto



data class BookResponse(

    val id: Long,

    val title: String,

    val authorId: Long,

    val authorName: String?,

    val bookCoverImage: String?,

    val status: String,

    val description: String? = null,

    val views: Long = 0,

    val featured: Boolean = false,

    val fileType: String? = null,

    val fileUrl: String? = null,

    val rateAvg: String? = null,

    val totalRate: Long = 0,

    val categoryId: String? = null,

    val categoryIds: List<Long> = emptyList(),

    val sectionIds: List<Long> = emptyList(),

    val acervos: List<AcervoOptionResponse> = emptyList()

)

