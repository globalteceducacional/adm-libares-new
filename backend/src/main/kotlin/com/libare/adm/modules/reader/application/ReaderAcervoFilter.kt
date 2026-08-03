package com.libare.adm.modules.reader.application

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/** Resolve acervo_id a partir de user_id / acervo_id (espelho PHP). */
@Component
class ReaderAcervoFilter(
    private val jdbc: JdbcTemplate
) {
    fun resolve(params: Map<String, String>): Long? {
        var acervoId: Long? = null
        val userId = params["user_id"]?.trim().orEmpty()
        if (userId.isNotBlank()) {
            acervoId = jdbc.query(
                "SELECT acervo_id FROM tbl_users WHERE id = ? LIMIT 1",
                { rs, _ ->
                    val v = rs.getObject("acervo_id")
                    if (v == null) null else rs.getLong("acervo_id")
                },
                userId.toLongOrNull() ?: 0L
            ).firstOrNull()
        }
        val direct = params["acervo_id"]?.trim().orEmpty()
        if (direct.isNotBlank()) {
            acervoId = direct.toLongOrNull()
        }
        return acervoId?.takeIf { it > 0 }
    }

    /** Fragmento SQL: INNER JOIN livros_acervos (sem placeholder). */
    fun joinAndClause(acervoId: Long?): String {
        if (acervoId == null) return ""
        return " INNER JOIN livros_acervos la ON la.book_id = tbl_books.id "
    }

    fun bookInAcervo(bookId: Long, acervoId: Long): Boolean {
        val count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM livros_acervos WHERE book_id = ? AND acervo_id = ?",
            Long::class.java,
            bookId,
            acervoId
        ) ?: 0L
        return count > 0
    }

    fun filterBookIdsCsv(csv: String, acervoId: Long?): String {
        if (acervoId == null || csv.isBlank()) return csv
        val ids = csv.split(",")
            .mapNotNull { it.trim().toLongOrNull() }
            .filter { it > 0 }
            .distinct()
        if (ids.isEmpty()) return ""
        val placeholders = ids.joinToString(",") { "?" }
        val args = mutableListOf<Any>(acervoId).apply { addAll(ids) }
        val kept = jdbc.query(
            "SELECT book_id FROM livros_acervos WHERE acervo_id = ? AND book_id IN ($placeholders)",
            { rs, _ -> rs.getLong("book_id") },
            *args.toTypedArray()
        )
        return kept.joinToString(",")
    }
}
