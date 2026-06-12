package com.libare.adm.modules.audit.api.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class AuditOverviewResponse(
    val ok: Boolean,
    val reason: String? = null,
    val moduleSummary: List<AuditModuleSummaryRow> = emptyList(),
    val recentSoftDeletes: List<AuditSoftDeleteRow> = emptyList(),
    val actorActivity: List<AuditActorActivityRow> = emptyList(),
    val softDeleteConsistency: List<AuditConsistencyRow> = emptyList(),
)

data class AuditModuleSummaryRow(
    val moduleName: String,
    val totalRows: Long,
    val activeRows: Long,
    val softDeletedRows: Long,
)

data class AuditSoftDeleteRow(
    val moduleName: String,
    val entityId: String,
    val entityLabel: String?,
    val deletedBy: Long?,
    val deletedAt: String?,
)

data class AuditActorActivityRow(
    val actorId: Long,
    val totalChanges: Long,
)

data class AuditConsistencyRow(
    val checkName: String,
    val invalidCount: Long,
)
