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

    private companion object {
        val LEGACY_STATUS_COLUMNS = listOf("status", "cat_status", "a_status")
    }

    fun execute(): AuditOverviewResponse {
        if (dataMode.trim().lowercase() != "core") {
            return executeLegacy()
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

    /** Contagens sobre tbl_* / dump PHP quando APP_DATA_MODE=legacy. */
    private fun executeLegacy(): AuditOverviewResponse {
        return try {
            AuditOverviewResponse(
                ok = true,
                moduleSummary = loadLegacyModuleSummary(),
                recentSoftDeletes = emptyList(),
                actorActivity = emptyList(),
                softDeleteConsistency = loadLegacyConsistency(),
            )
        } catch (ex: DataAccessException) {
            logger.warn("Falha ao consultar auditoria legado", ex)
            AuditOverviewResponse(ok = false, reason = "AUDIT_QUERY_FAILED")
        }
    }

    /**
     * O dump PHP usa nomes de status diferentes por tabela (`status`, `cat_status`, `a_status`)
     * e `tbl_comments` nao tem status. A coluna e resolvida no schema para a pagina nunca
     * falhar inteira por causa de uma tabela divergente.
     */
    private fun loadLegacyModuleSummary(): List<AuditModuleSummaryRow> {
        val rows = mutableListOf<AuditModuleSummaryRow>()
        countLegacy("tbl_books", "Livros")?.let { rows += it }
        countLegacy("tbl_author", "Autores")?.let { rows += it }
        countLegacy("tbl_category", "Categorias")?.let { rows += it }
        countLegacy("tbl_home_section", "Secoes da home")?.let { rows += it }
        countLegacy("acervos", "Acervos")?.let { rows += it }
        countLegacy("tbl_users", "Usuarios")?.let { rows += it }
        countLegacy("tbl_comments", "Comentarios")?.let { rows += it }
        countLegacy("Sites", "Sites")?.let { rows += it }
        countLegacy("Jogos", "Jogos")?.let { rows += it }
        countLegacy("tbl_settings", "Definicoes")?.let { rows += it }
        return rows
    }

    private fun countLegacy(table: String, label: String): AuditModuleSummaryRow? {
        if (!tableExists(table)) {
            return null
        }
        val total = jdbc.queryForObject("SELECT COUNT(*) FROM `$table`", Long::class.java) ?: 0L
        val statusColumn = LEGACY_STATUS_COLUMNS.firstOrNull { columnExists(table, it) }
        val active = if (statusColumn == null) {
            total
        } else {
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM `$table` WHERE CAST(`$statusColumn` AS CHAR) = '1'",
                Long::class.java
            ) ?: 0L
        }
        return AuditModuleSummaryRow(
            moduleName = label,
            totalRows = total,
            activeRows = active,
            softDeletedRows = (total - active).coerceAtLeast(0)
        )
    }

    private fun loadLegacyConsistency(): List<AuditConsistencyRow> {
        val rows = mutableListOf<AuditConsistencyRow>()
        if (tableExists("tbl_books") && tableExists("tbl_category")) {
            // cat_id e varchar e pode conter lista ("5,6"); FIND_IN_SET evita falso positivo.
            val orphanCats = jdbc.queryForObject(
                """
                SELECT COUNT(*) FROM tbl_books b
                WHERE TRIM(COALESCE(b.cat_id, '')) NOT IN ('', '0')
                  AND NOT EXISTS (
                    SELECT 1 FROM tbl_category c WHERE FIND_IN_SET(c.cid, b.cat_id)
                  )
                """.trimIndent(),
                Long::class.java
            ) ?: 0L
            rows += AuditConsistencyRow(checkName = "Livros sem categoria valida", invalidCount = orphanCats)
        }
        if (tableExists("tbl_books") && tableExists("tbl_author")) {
            val orphanAuthors = jdbc.queryForObject(
                """
                SELECT COUNT(*) FROM tbl_books b
                LEFT JOIN tbl_author a ON a.author_id = b.aid
                WHERE b.aid <> 0 AND a.author_id IS NULL
                """.trimIndent(),
                Long::class.java
            ) ?: 0L
            rows += AuditConsistencyRow(checkName = "Livros sem autor valido", invalidCount = orphanAuthors)
        }
        if (tableExists("tbl_comments") && tableExists("tbl_books")) {
            val orphanComments = jdbc.queryForObject(
                """
                SELECT COUNT(*) FROM tbl_comments c
                LEFT JOIN tbl_books b ON b.id = c.book_id
                WHERE b.id IS NULL
                """.trimIndent(),
                Long::class.java
            ) ?: 0L
            rows += AuditConsistencyRow(checkName = "Comentarios sem livro", invalidCount = orphanComments)
        }
        if (tableExists("tbl_settings")) {
            val settings = jdbc.queryForObject(
                "SELECT COUNT(*) FROM tbl_settings WHERE id = 1",
                Long::class.java
            ) ?: 0L
            rows += AuditConsistencyRow(
                checkName = "tbl_settings sem linha id=1",
                invalidCount = if (settings == 0L) 1L else 0L
            )
        }
        return rows
    }

    private fun tableExists(table: String): Boolean {
        val count = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = ?
            """.trimIndent(),
            Int::class.java,
            table
        ) ?: 0
        return count > 0
    }

    private fun columnExists(table: String, column: String): Boolean {
        val count = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
            """.trimIndent(),
            Int::class.java,
            table,
            column
        ) ?: 0
        return count > 0
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
