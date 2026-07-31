package com.libare.adm.modules.audit.api

import com.libare.adm.modules.audit.api.dto.AuditOverviewResponse
import com.libare.adm.modules.audit.application.GetAuditOverviewUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = OpenApiTags.AUDIT,
    description = "Visao geral de auditoria e rastreabilidade de acoes no painel."
)
@RestController
@RequestMapping("/api/v1/audit")
class AuditController(
    private val getAuditOverviewUseCase: GetAuditOverviewUseCase,
) {
    @Operation(
        summary = "Visao geral de auditoria",
        description = "Resumo de eventos e registros de auditoria do sistema."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Overview de auditoria",
            content = [Content(schema = Schema(implementation = AuditOverviewResponse::class))]
        )
    )
    @GetMapping("/overview")
    fun overview(): ResponseEntity<AuditOverviewResponse> =
        ResponseEntity.ok(getAuditOverviewUseCase.execute())
}
