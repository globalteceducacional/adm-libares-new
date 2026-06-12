package com.libare.adm.shared.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class DataModeStartupValidator(
    @Value("\${app.data.mode:legacy}") private val dataMode: String,
    private val jdbcTemplate: JdbcTemplate
) : CommandLineRunner {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun run(vararg args: String?) {
        val normalizedMode = dataMode.trim().lowercase()
        if (normalizedMode == "legacy") {
            logger.info("APP_DATA_MODE=legacy ativo: backend usando tabelas legadas.")
            return
        }

        if (normalizedMode != "core") {
            throw IllegalStateException("Valor invalido para app.data.mode: '$dataMode'. Use 'legacy' ou 'core'.")
        }

        val requiredViews = listOf(
            "tbl_admin",
            "tbl_users",
            "tbl_category",
            "tbl_author",
            "tbl_books",
            "tbl_comments",
            "tbl_active_log",
            "tbl_settings"
        )

        val missing = requiredViews.filterNot { viewExists(it) }
        if (missing.isNotEmpty()) {
            throw IllegalStateException(
                "APP_DATA_MODE=core ativo, mas faltam views de compatibilidade: ${
                    missing.joinToString(", ")
                }. Execute scripts/migration/007_create_legacy_compat_views.sql"
            )
        }

        logger.info("APP_DATA_MODE=core ativo: views de compatibilidade validadas com sucesso.")
    }

    private fun viewExists(viewName: String): Boolean {
        val count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.views
            WHERE table_schema = DATABASE() AND table_name = ?
            """.trimIndent(),
            Long::class.java,
            viewName
        )
        return count > 0
    }
}
