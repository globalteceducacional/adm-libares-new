package com.libare.adm.modules.rbac.api

import com.libare.adm.modules.rbac.api.dto.AdminSchoolAssignmentResponse
import com.libare.adm.modules.rbac.api.dto.AssignAdminSchoolsRequest
import com.libare.adm.modules.rbac.application.AssignAdminSchoolsUseCase
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/admin-users")
class AdminUserController(
    private val assignAdminSchoolsUseCase: AssignAdminSchoolsUseCase
) {
    @PutMapping("/{adminUserId}/schools")
    fun assignSchools(
        @PathVariable adminUserId: Long,
        @Valid @RequestBody request: AssignAdminSchoolsRequest
    ): ResponseEntity<AdminSchoolAssignmentResponse> =
        ResponseEntity.ok(assignAdminSchoolsUseCase.execute(adminUserId, request.schoolIds))
}
