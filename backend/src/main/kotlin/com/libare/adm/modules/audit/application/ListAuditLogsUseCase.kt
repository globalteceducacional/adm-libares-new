package com.libare.adm.modules.audit.application

import com.libare.adm.modules.audit.api.dto.AuditLogResponse
import com.libare.adm.shared.api.PageResponse
import org.springframework.dao.DataAccessException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ListAuditLogsUseCase(
    private val jdbc: JdbcTemplate
) {
    fun execute(page: Int, size: Int): PageResponse<AuditLogResponse> {
        val effectivePage = page.coerceAtLeast(1)
        val effectiveSize = size.coerceIn(1, 200)
        val offset = (effectivePage - 1) * effectiveSize

        return try {
            val items = jdbc.query(
                "SELECT id, user_id, date_time FROM tbl_active_log ORDER BY id DESC LIMIT ? OFFSET ?",
                { rs, _ ->
                    AuditLogResponse(
                        id = rs.getLong("id"),
                        userId = rs.getLong("user_id"),
                        dateTime = rs.getString("date_time") ?: ""
                    )
                },
                effectiveSize,
                offset
            )

            val total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM tbl_active_log",
                Long::class.java
            ) ?: 0L

            PageResponse(items = items, total = total, page = effectivePage, size = effectiveSize)
        } catch (ex: DataAccessException) {
            PageResponse(items = emptyList(), total = 0L, page = effectivePage, size = effectiveSize)
        }
    }
}
