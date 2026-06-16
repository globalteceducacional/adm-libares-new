package com.libare.adm.shared.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class DataModeStartupValidator(
    @Value("\${app.data.mode:core}") private val dataMode: String,
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

        val requiredTables = listOf(
            "app_admin_users",
            "app_users",
            "catalog_categories",
            "catalog_authors",
            "catalog_books",
            "engagement_comments",
            "app_settings",
            "app_user_activity_logs",
        )

        val missing = requiredTables.filterNot { tableExists(it) }
        if (missing.isNotEmpty()) {
            throw IllegalStateException(
                "APP_DATA_MODE=core ativo, mas faltam tabelas do schema core: ${missing.joinToString(", ")}. " +
                    "Execute as migrations Flyway (V1__core_schema.sql)."
            )
        }

        logger.info("APP_DATA_MODE=core ativo: tabelas do schema core validadas com sucesso.")
    }

    private fun tableExists(tableName: String): Boolean {
        val count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = current_schema()
              AND table_name = ?
              AND table_type = 'BASE TABLE'
            """.trimIndent(),
            Long::class.java,
            tableName
        )
        return (count ?: 0L) > 0
    }
}
