package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ReaderReadingUseCases(
    private val jdbc: JdbcTemplate,
    private val mapper: ReaderBookRowMapper,
    private val urls: LegacyAssetUrlBuilder
) {
    fun bookPageStateList(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0 || bookId <= 0) return EbookAppEnvelope.array(emptyList())
        val rows = jdbc.query(
            """
            SELECT page, note, is_bookmark, updated_at
            FROM tbl_book_page_notes
            WHERE user_id = ? AND book_id = ?
            ORDER BY page ASC
            """.trimIndent(),
            { rs, _ ->
                mapOf(
                    "page" to rs.getInt("page"),
                    "note" to (rs.getString("note") ?: ""),
                    "is_bookmark" to if (rs.getInt("is_bookmark") == 1) "1" else "0",
                    "updated_at" to (rs.getString("updated_at") ?: "")
                )
            },
            userId,
            bookId
        )
        return EbookAppEnvelope.array(rows)
    }

    fun bookPageStateSave(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        val page = params["page"]?.toIntOrNull() ?: 0
        val isBookmark = if ((params["is_bookmark"]?.toIntOrNull() ?: 0) == 1) 1 else 0
        val noteProvided = params.containsKey("note")
        val note = params["note"].orEmpty()
        if (userId <= 0 || bookId <= 0 || page <= 0) {
            return EbookAppEnvelope.arrayOne(
                mapOf("success" to "0", "msg" to "Parâmetros inválidos")
            )
        }
        val existing = jdbc.query(
            """
            SELECT id, note, is_bookmark FROM tbl_book_page_notes
            WHERE user_id = ? AND book_id = ? AND page = ? LIMIT 1
            """.trimIndent(),
            { rs, _ ->
                Triple(rs.getLong("id"), rs.getString("note").orEmpty(), rs.getInt("is_bookmark"))
            },
            userId, bookId, page
        ).firstOrNull()

        val effectiveNote = if (noteProvided) note else (existing?.second ?: "")
        if (existing != null) {
            if (isBookmark == 0 && effectiveNote.isBlank()) {
                jdbc.update("DELETE FROM tbl_book_page_notes WHERE id = ?", existing.first)
            } else if (noteProvided) {
                jdbc.update(
                    "UPDATE tbl_book_page_notes SET is_bookmark = ?, note = ? WHERE id = ?",
                    isBookmark, note, existing.first
                )
            } else {
                jdbc.update(
                    "UPDATE tbl_book_page_notes SET is_bookmark = ? WHERE id = ?",
                    isBookmark, existing.first
                )
            }
        } else if (isBookmark == 1 || effectiveNote.isNotBlank()) {
            jdbc.update(
                """
                INSERT INTO tbl_book_page_notes (user_id, book_id, page, is_bookmark, note)
                VALUES (?, ?, ?, ?, ?)
                """.trimIndent(),
                userId, bookId, page, isBookmark, effectiveNote
            )
        }
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "success" to "1",
                "page" to page,
                "is_bookmark" to isBookmark.toString(),
                "note" to effectiveNote
            )
        )
    }

    fun continueReading(params: Map<String, String>): Map<String, Any> {
        val userId = params["con_user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["con_book_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0 || bookId <= 0) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to "con_user_id ou con_book_id está faltando.... !", "success" to "0")
            )
        }
        val currentPage = (params["current_page"]?.toIntOrNull() ?: 1).coerceAtLeast(1)
        val totalPages = params["total_pages"]?.toIntOrNull() ?: 0
        if (totalPages > 0 && currentPage >= totalPages) {
            jdbc.update("DELETE FROM tbl_reading WHERE user_id = ? AND book_id = ?", userId, bookId)
            return EbookAppEnvelope.arrayOne(
                mapOf(
                    "msg" to "Leitura concluída e removida da lista de leitura contínua!",
                    "success" to "1"
                )
            )
        }
        val exists = jdbc.query(
            "SELECT id FROM tbl_reading WHERE user_id = ? AND book_id = ? LIMIT 1",
            { rs, _ -> rs.getLong("id") },
            userId, bookId
        ).firstOrNull()
        return try {
            if (exists != null) {
                jdbc.update(
                    "UPDATE tbl_reading SET current_page = ?, total_pages = ? WHERE user_id = ? AND book_id = ?",
                    currentPage, totalPages, userId, bookId
                )
            } else {
                jdbc.update(
                    "INSERT INTO tbl_reading (user_id, book_id, current_page, total_pages) VALUES (?, ?, ?, ?)",
                    userId, bookId, currentPage, totalPages
                )
            }
            EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Leitura contínua salva com sucesso!", "success" to "1")
            )
        } catch (_: Exception) {
            EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Leitura contínua não salva!", "success" to "0")
            )
        }
    }

    fun continueReadingBook(params: Map<String, String>): Map<String, Any> {
        val userId = params["con_read_user_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0) return EbookAppEnvelope.array(emptyList())
        val readings = jdbc.query(
            "SELECT * FROM tbl_reading WHERE user_id = ?",
            { rs, _ ->
                Triple(rs.getLong("book_id"), rs.getInt("current_page"), rs.getInt("total_pages"))
            },
            userId
        )
        val out = mutableListOf<Map<String, Any?>>()
        for ((bookId, currentPage, totalPages) in readings) {
            val books = jdbc.query(
                """
                SELECT tbl_books.*, tbl_author.author_id, tbl_author.author_name, tbl_author.author_description,
                       tbl_category.cid, tbl_category.category_name, tbl_category.category_image
                FROM tbl_books
                LEFT JOIN tbl_category ON tbl_books.cat_id = tbl_category.cid
                LEFT JOIN tbl_author ON tbl_books.aid = tbl_author.author_id
                WHERE tbl_books.id = ?
                """.trimIndent(),
                { rs, _ ->
                    val row = mapper.mapBook(rs, includeFeatured = true, stripDescription = true)
                    row["user_id"] = userId
                    row["book_cover_img"] = urls.images(rs.getString("book_cover_img"))
                    row["current_page"] = currentPage
                    row["total_pages"] = totalPages
                    row
                },
                bookId
            )
            out.addAll(books)
        }
        return EbookAppEnvelope.array(out)
    }

    fun removeUser(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val n = jdbc.update("DELETE FROM tbl_users WHERE id = ?", userId)
        return EbookAppEnvelope.arrayOne(
            if (n > 0) {
                mapOf("msg" to "Usuário excluído com sucesso!", "success" to "1")
            } else {
                mapOf("msg" to "Usuário não excluído!", "success" to "0")
            }
        )
    }

    fun deleteUserData(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val exists = jdbc.query(
            "SELECT id FROM tbl_users WHERE id = ? LIMIT 1",
            { rs, _ -> rs.getLong("id") },
            userId
        ).firstOrNull()
        if (exists == null) {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to "Usuário não encontrado", "success" to "0")
            )
        }
        jdbc.update("UPDATE tbl_users SET is_deleted = 1 WHERE id = ?", userId)
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "MSG" to "Este usuário foi excluído. Entre em contato com o administrador.",
                "success" to "1"
            )
        )
    }
}
