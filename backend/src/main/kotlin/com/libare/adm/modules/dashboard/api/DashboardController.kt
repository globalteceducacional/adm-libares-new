package com.libare.adm.modules.dashboard.api

import com.libare.adm.modules.dashboard.api.dto.DashboardSummaryResponse
import com.libare.adm.modules.dashboard.application.GetDashboardSummaryUseCase
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/dashboard")
class DashboardController(
    private val getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
) {
    @GetMapping("/summary")
    fun summary(
        @RequestParam(name = "periodDays", required = false) periodDays: Int?
    ): ResponseEntity<DashboardSummaryResponse> =
        ResponseEntity.ok(getDashboardSummaryUseCase.execute(periodDays))
}
