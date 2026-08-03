package com.libare.adm.modules.reader.application

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

/** Upsert de atividade do leitor em tbl_active_log (espelho user_login_api.php). */
@Service
class ReaderActiveLogService(
    private val jdbc: JdbcTemplate
) {
    fun touch(userId: Long) {
        val now = (System.currentTimeMillis() / 1000L).toString()
        val updated = jdbc.update(
            "UPDATE tbl_active_log SET date_time = ? WHERE user_id = ?",
            now,
            userId
        )
        if (updated == 0) {
            jdbc.update(
                "INSERT INTO tbl_active_log (user_id, date_time) VALUES (?, ?)",
                userId,
                now
            )
        }
    }
}
