package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Service
class ReaderBookDetailUseCase(
    private val jdbc: JdbcTemplate,
    private val acervo: ReaderAcervoFilter,
    private val mapper: ReaderBookRowMapper,
    private val urls: LegacyAssetUrlBuilder
) {
    fun bookId(params: Map<String, String>): Map<String, Any> {
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        val acervoId = acervo.resolve(params)
        if (acervoId != null && !acervo.bookInAcervo(bookId, acervoId)) {
            return EbookAppEnvelope.array(emptyList())
        }

        val join = ""
        val sql = """
            SELECT tbl_books.*, tbl_author.author_id, tbl_author.author_name, tbl_author.author_description,
                   tbl_category.cid, tbl_category.category_name, tbl_category.category_image
            FROM tbl_books $join
            LEFT JOIN tbl_category ON tbl_books.cat_id = tbl_category.cid
            LEFT JOIN tbl_author ON tbl_books.aid = tbl_author.author_id
            WHERE tbl_books.id = ?
        """.trimIndent()

        val books = jdbc.query(sql, { rs, _ ->
            val row = mapper.mapBook(rs, includeFeatured = true, stripDescription = true)
            val catId = rs.getString("cat_id").orEmpty()
            row["related_books"] = relatedBooks(bookId, catId, acervoId)
            row["user_comments"] = comments(bookId)
            row
        }, bookId)

        if (books.isNotEmpty()) {
            jdbc.update("UPDATE tbl_books SET book_views = COALESCE(book_views, 0) + 1 WHERE id = ?", bookId)
        }
        return EbookAppEnvelope.array(books)
    }

    private fun relatedBooks(bookId: Long, catId: String, acervoId: Long?): List<Map<String, Any?>> {
        val join = acervo.joinAndClause(acervoId)
        val acervoSql = if (acervoId != null) " AND la.acervo_id = ?" else ""
        val sql = """
            SELECT tbl_books.*, tbl_author.author_id, tbl_author.author_name, tbl_author.author_description,
                   tbl_category.cid, tbl_category.category_name, tbl_category.category_image
            FROM tbl_books $join
            LEFT JOIN tbl_category ON tbl_books.cat_id = tbl_category.cid
            LEFT JOIN tbl_author ON tbl_books.aid = tbl_author.author_id
            WHERE tbl_books.id != ? AND tbl_books.cat_id = ? $acervoSql
        """.trimIndent()
        val args = mutableListOf<Any>(bookId, catId)
        if (acervoId != null) args.add(acervoId)
        return jdbc.query(sql, { rs, _ -> mapper.mapRelated(rs) }, *args.toTypedArray())
    }

    private fun comments(bookId: Long): List<Map<String, Any?>> {
        return try {
            jdbc.query(
                "SELECT * FROM tbl_comments WHERE book_id = ? ORDER BY id",
                { rs, _ ->
                    val userImageRaw = rs.getString("user_image")
                    val userType = rs.getString("user_type").orEmpty()
                    val userImage = when {
                        userImageRaw.isNullOrBlank() -> urls.images(null)
                        userType.equals("Google", true) || userType.equals("Facebook", true) ->
                            if (userImageRaw.startsWith("http")) userImageRaw else urls.images(userImageRaw)
                        else -> urls.images(userImageRaw)
                    }
                    mapOf(
                        "id" to rs.getObject("id"),
                        "book_id" to rs.getObject("book_id"),
                        "user_id" to rs.getObject("user_id"),
                        "user_name" to rs.getString("user_name"),
                        "user_image" to userImage,
                        "comment_text" to rs.getString("comment_text"),
                        "dt_rate" to formatDt(rs.getString("dt_rate") ?: rs.getString("comment_on"))
                    )
                },
                bookId
            )
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun formatDt(raw: String?): String {
        if (raw.isNullOrBlank()) return ""
        return try {
            val date = LocalDate.parse(raw.take(10))
            date.format(DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH))
        } catch (_: Exception) {
            raw
        }
    }
}
