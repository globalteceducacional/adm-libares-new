package com.libare.adm.modules.schools.api

import com.libare.adm.modules.schools.api.dto.CreateSchoolAdminRequest
import com.libare.adm.modules.schools.api.dto.SchoolAdminResponse
import com.libare.adm.modules.schools.api.dto.SchoolResponse
import com.libare.adm.modules.schools.api.dto.UpsertSchoolRequest
import com.libare.adm.modules.schools.application.CreateSchoolAdminUseCase
import com.libare.adm.modules.schools.application.CreateSchoolUseCase
import com.libare.adm.modules.schools.application.DeleteSchoolUseCase
import com.libare.adm.modules.schools.application.GetSchoolUseCase
import com.libare.adm.modules.schools.application.ListSchoolsUseCase
import com.libare.adm.modules.schools.application.UpdateSchoolUseCase
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/schools")
class SchoolController(
    private val listSchoolsUseCase: ListSchoolsUseCase,
    private val getSchoolUseCase: GetSchoolUseCase,
    private val createSchoolUseCase: CreateSchoolUseCase,
    private val updateSchoolUseCase: UpdateSchoolUseCase,
    private val deleteSchoolUseCase: DeleteSchoolUseCase,
    private val createSchoolAdminUseCase: CreateSchoolAdminUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<SchoolResponse>> =
        ResponseEntity.ok(listSchoolsUseCase.execute())

    @GetMapping("/{schoolId}")
    fun get(@PathVariable schoolId: Long): ResponseEntity<SchoolResponse> =
        ResponseEntity.ok(getSchoolUseCase.execute(schoolId))

    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSchoolRequest): ResponseEntity<SchoolResponse> {
        val created = createSchoolUseCase.execute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{schoolId}")
    fun update(
        @PathVariable schoolId: Long,
        @Valid @RequestBody request: UpsertSchoolRequest
    ): ResponseEntity<SchoolResponse> =
        ResponseEntity.ok(updateSchoolUseCase.execute(schoolId, request))

    @DeleteMapping("/{schoolId}")
    fun delete(@PathVariable schoolId: Long): ResponseEntity<Void> {
        deleteSchoolUseCase.execute(schoolId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{schoolId}/admins")
    fun createAdmin(
        @PathVariable schoolId: Long,
        @Valid @RequestBody request: CreateSchoolAdminRequest
    ): ResponseEntity<SchoolAdminResponse> {
        val created = createSchoolAdminUseCase.execute(schoolId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }
}
