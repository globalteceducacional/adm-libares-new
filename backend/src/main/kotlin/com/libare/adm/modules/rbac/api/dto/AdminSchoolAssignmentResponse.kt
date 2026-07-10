package com.libare.adm.modules.rbac.api.dto

import jakarta.validation.constraints.NotEmpty

data class AssignAdminSchoolsRequest(
    @field:NotEmpty(message = "Informe ao menos uma escola")
    val schoolIds: List<Long>
)

data class AdminSchoolAssignmentResponse(
    val adminUserId: Long,
    val schoolIds: List<Long>
)
