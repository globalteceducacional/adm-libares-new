package com.libare.adm.modules.rbac.api.dto

data class RoleResponse(
    val id: Long,
    val schoolId: Long?,
    val name: String,
    val isSystem: Boolean,
    val status: String,
    val permissionCodes: List<String>
)
