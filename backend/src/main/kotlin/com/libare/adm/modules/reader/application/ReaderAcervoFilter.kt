package com.libare.adm.modules.reader.application

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
 * Escopo de catalogo resolvido para uma requisicao do app (ADR 0006).
 *
 * - [acervoId] != null -> filtra por `livros_acervos`
 * - [isEmpty] -> leitor identificado **sem** acervo: nao ve nada
 * - ambos falsos -> sem filtro (requisicao anonima legada, sem `user_id`)
 */
data class ReaderScope(val acervoId: Long?, val isEmpty: Boolean) {
    companion object {
        val UNRESTRICTED = ReaderScope(acervoId = null, isEmpty = false)
        val EMPTY = ReaderScope(acervoId = null, isEmpty = true)
        fun of(acervoId: Long) = ReaderScope(acervoId = acervoId, isEmpty = false)
    }
}

/** Resolve o escopo de acervo a partir de `user_id` / `acervo_id` (espelho PHP, endurecido). */
@Component
class ReaderAcervoFilter(
    private val jdbc: JdbcTemplate
) {
    /**
     * Com `user_id`: o acervo do usuario e a fonte de verdade e `acervo_id` da query e ignorado.
     * Usuario sem acervo -> [ReaderScope.EMPTY]. Sem `user_id`: comportamento legado.
     */
    fun resolve(params: Map<String, String>): ReaderScope {
        val userId = params["user_id"]?.trim()?.toLongOrNull()
        if (userId != null && userId > 0) {
            val acervoId = jdbc.query(
                "SELECT acervo_id FROM tbl_users WHERE id = ? LIMIT 1",
                { rs, _ ->
                    val v = rs.getObject("acervo_id")
                    if (v == null) null else rs.getLong("acervo_id")
                },
                userId
            ).firstOrNull()
            return acervoId?.takeIf { it > 0 }?.let { ReaderScope.of(it) } ?: ReaderScope.EMPTY
        }

        val direct = params["acervo_id"]?.trim()?.toLongOrNull()
        return direct?.takeIf { it > 0 }?.let { ReaderScope.of(it) } ?: ReaderScope.UNRESTRICTED
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
