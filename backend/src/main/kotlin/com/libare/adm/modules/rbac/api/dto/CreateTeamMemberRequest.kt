package com.libare.adm.modules.rbac.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CreateTeamMemberRequest(
    @field:NotBlank @field:Size(max = 100) val username: String,
    @field:NotBlank @field:Size(min = 6, max = 100) val password: String,
    @field:NotBlank @field:Size(max = 150) val name: String,
    @field:NotNull val schoolId: Long,
    @field:NotBlank val roleCode: String
)
