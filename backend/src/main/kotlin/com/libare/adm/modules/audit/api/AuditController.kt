package com.libare.adm.modules.audit.api

import com.libare.adm.modules.audit.api.dto.AuditOverviewResponse
import com.libare.adm.modules.audit.application.GetAuditOverviewUseCase
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/audit")
class AuditController(
    private val getAuditOverviewUseCase: GetAuditOverviewUseCase,
) {
    @GetMapping("/overview")
    fun overview(): ResponseEntity<AuditOverviewResponse> =
        ResponseEntity.ok(getAuditOverviewUseCase.execute())
}
