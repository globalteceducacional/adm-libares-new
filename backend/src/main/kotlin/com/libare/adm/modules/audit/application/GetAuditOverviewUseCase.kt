package com.libare.adm.modules.audit.application

import com.libare.adm.modules.audit.api.dto.AuditActorActivityRow
import com.libare.adm.modules.audit.api.dto.AuditConsistencyRow
import com.libare.adm.modules.audit.api.dto.AuditModuleSummaryRow
import com.libare.adm.modules.audit.api.dto.AuditOverviewResponse
import com.libare.adm.modules.audit.api.dto.AuditSoftDeleteRow
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DataAccessException
import org.springframework.jdbc.BadSqlGrammarException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.sql.ResultSet
import java.time.ZoneOffset

@Service
class GetAuditOverviewUseCase(
    private val jdbc: JdbcTemplate,
    @Value("\${app.data.mode:legacy}") private val dataMode: String,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun execute(): AuditOverviewResponse {
        if (dataMode.trim().lowercase() != "core") {
            return AuditOverviewResponse(ok = false, reason = "CORE_MODE_REQUIRED")
        }
        return try {
            AuditOverviewResponse(
                ok = true,
                moduleSummary = loadModuleSummary(),
                recentSoftDeletes = loadRecentSoftDeletes(),
                actorActivity = loadActorActivity(),
                softDeleteConsistency = loadConsistency(),
            )
        } catch (ex: BadSqlGrammarException) {
            logger.warn("Views de auditoria ausentes ou invalidas (execute scripts/migration/012_audit_views.sql)", ex)
            AuditOverviewResponse(ok = false, reason = "AUDIT_VIEWS_MISSING")
        } catch (ex: DataAccessException) {
            logger.warn("Falha ao consultar auditoria", ex)
            AuditOverviewResponse(ok = false, reason = "AUDIT_QUERY_FAILED")
        }
    }

    private fun loadModuleSummary(): List<AuditModuleSummaryRow> =
        jdbc.query(
            """
            SELECT module_name AS moduleName,
                   total_rows AS totalRows,
                   active_rows AS activeRows,
                   soft_deleted_rows AS softDeletedRows
            FROM vw_audit_module_summary
            """.trimIndent(),
        ) { rs, _ -> mapModuleSummary(rs) }

    private fun mapModuleSummary(rs: ResultSet): AuditModuleSummaryRow =
        AuditModuleSummaryRow(
            moduleName = rs.getString("moduleName"),
            totalRows = rs.getLong("totalRows"),
            activeRows = rs.getLong("activeRows"),
            softDeletedRows = rs.getLong("softDeletedRows"),
        )

    private fun loadRecentSoftDeletes(): List<AuditSoftDeleteRow> =
        jdbc.query(
            """
            SELECT module_name AS moduleName,
                   entity_id AS entityId,
                   entity_label AS entityLabel,
                   deleted_by AS deletedBy,
                   deleted_at AS deletedAt
            FROM vw_audit_recent_soft_deletes
            ORDER BY deleted_at DESC
            LIMIT 100
            """.trimIndent(),
        ) { rs, _ ->
            AuditSoftDeleteRow(
                moduleName = rs.getString("moduleName"),
                entityId = rs.getString("entityId"),
                entityLabel = rs.getString("entityLabel"),
                deletedBy = readNullableLong(rs, "deletedBy"),
                deletedAt = readInstantString(rs, "deletedAt"),
            )
        }

    private fun loadActorActivity(): List<AuditActorActivityRow> =
        jdbc.query(
            """
            SELECT actor_id AS actorId,
                   total_changes AS totalChanges
            FROM vw_audit_actor_activity
            ORDER BY total_changes DESC
            LIMIT 50
            """.trimIndent(),
        ) { rs, _ ->
            AuditActorActivityRow(
                actorId = rs.getLong("actorId"),
                totalChanges = rs.getLong("totalChanges"),
            )
        }

    private fun loadConsistency(): List<AuditConsistencyRow> =
        jdbc.query(
            """
            SELECT check_name AS checkName,
                   invalid_count AS invalidCount
            FROM vw_audit_soft_delete_consistency
            """.trimIndent(),
        ) { rs, _ ->
            AuditConsistencyRow(
                checkName = rs.getString("checkName"),
                invalidCount = rs.getLong("invalidCount"),
            )
        }

    private fun readInstantString(rs: ResultSet, column: String): String? {
        val ts = rs.getTimestamp(column) ?: return null
        return ts.toInstant().atOffset(ZoneOffset.UTC).toString()
    }

    private fun readNullableLong(rs: ResultSet, column: String): Long? {
        val v = rs.getObject(column) ?: return null
        return when (v) {
            is Long -> v
            is Number -> v.toLong()
            else -> null
        }
    }
}
