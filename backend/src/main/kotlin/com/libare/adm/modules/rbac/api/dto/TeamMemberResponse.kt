package com.libare.adm.modules.rbac.api.dto

data class TeamMemberResponse(
    val id: Long,
    val username: String,
    val name: String,
    val schoolId: Long,
    val schoolName: String?,
    val roleCode: String,
    val status: String
)
