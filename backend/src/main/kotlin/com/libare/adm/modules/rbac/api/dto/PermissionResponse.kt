package com.libare.adm.modules.rbac.api.dto

data class PermissionResponse(
    val id: Long,
    val code: String,
    val module: String,
    val description: String
)
