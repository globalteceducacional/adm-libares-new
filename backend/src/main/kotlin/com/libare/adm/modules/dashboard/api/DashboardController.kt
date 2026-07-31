package com.libare.adm.modules.dashboard.api

import com.libare.adm.modules.dashboard.api.dto.DashboardSummaryResponse
import com.libare.adm.modules.dashboard.application.GetDashboardSummaryUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = OpenApiTags.DASHBOARD,
    description = "Indicadores e resumo do painel admin."
)
@RestController
@RequestMapping("/api/v1/dashboard")
class DashboardController(
    private val getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
) {
    @Operation(
        summary = "Resumo do dashboard",
        description = "Metricas agregadas (usuarios, livros, comentarios, etc.) para o periodo informado."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Resumo calculado",
            content = [Content(schema = Schema(implementation = DashboardSummaryResponse::class))]
        )
    )
    @GetMapping("/summary")
    fun summary(
        @Parameter(description = "Janela em dias para agregacao (padrao definido pelo backend se omitido)")
        @RequestParam(name = "periodDays", required = false) periodDays: Int?
    ): ResponseEntity<DashboardSummaryResponse> =
        ResponseEntity.ok(getDashboardSummaryUseCase.execute(periodDays))
}
