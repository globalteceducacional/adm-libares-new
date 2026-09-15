package com.libare.adm.modules.games.api.dto

data class GameResponse(
    val id: Int,
    val catId: String,
    val authorId: Int,
    val featured: Int,
    val title: String,
    val description: String,
    val coverImage: String,
    val fileType: String,
    val fileUrl: String,
    val views: Int,
    val status: Int
)

data class UpsertGameRequest(
    val catId: String,
    val authorId: Int = 0,
    val featured: Int = 0,
    val title: String,
    val description: String,
    val coverImage: String = "",
    val fileType: String = "ludo_educativo",
    val fileUrl: String,
    val status: Int = 1
)
