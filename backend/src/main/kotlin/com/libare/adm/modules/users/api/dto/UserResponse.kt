package com.libare.adm.modules.users.api.dto

data class UserResponse(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String?,
    val userType: String,
    val userImage: String?,
    val status: String
)
