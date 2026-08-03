package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Service
class ReaderSocialUseCases(
    private val jdbc: JdbcTemplate,
    private val urls: LegacyAssetUrlBuilder
) {
    fun removeComment(params: Map<String, String>): Map<String, Any> {
        val id = params["comment_id"]?.toLongOrNull() ?: 0L
        val n = jdbc.update("DELETE FROM tbl_comments WHERE id = ?", id)
        return EbookAppEnvelope.arrayOne(
            if (n > 0) {
                mapOf("msg" to "Comentário excluído com sucesso!", "success" to "1")
            } else {
                mapOf("msg" to "Comentário não excluído!", "success" to "0")
            }
        )
    }

    fun addComment(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        val text = params["comment_text"]?.trim().orEmpty()
        if (text.isBlank()) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Comentário não pode estar vazio!", "success" to "0")
            )
        }
        val user = jdbc.query(
            "SELECT name, user_image, user_type FROM tbl_users WHERE id = ?",
            { rs, _ ->
                Triple(
                    rs.getString("name").orEmpty(),
                    rs.getString("user_image").orEmpty(),
                    rs.getString("user_type").orEmpty()
                )
            },
            userId
        ).firstOrNull()
            ?: return EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Usuário não encontrado!", "success" to "0")
            )
        return try {
            jdbc.update(
                """
                INSERT INTO tbl_comments (book_id, user_id, user_name, user_image, user_type, comment_text, dt_rate)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
                """.trimIndent(),
                bookId, userId, user.first, user.second, user.third, text
            )
            EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Comentário enviado com sucesso!", "success" to "1")
            )
        } catch (_: Exception) {
            // schema legado pode não ter user_type em comments
            try {
                jdbc.update(
                    """
                    INSERT INTO tbl_comments (book_id, user_id, user_name, user_image, comment_text, comment_on)
                    VALUES (?, ?, ?, ?, ?, NOW())
                    """.trimIndent(),
                    bookId, userId, user.first, user.second, text
                )
                EbookAppEnvelope.arrayOne(
                    mapOf("msg" to "Comentário enviado com sucesso!", "success" to "1")
                )
            } catch (_: Exception) {
                EbookAppEnvelope.arrayOne(
                    mapOf("msg" to "Erro ao enviar comentário!", "success" to "0")
                )
            }
        }
    }

    fun getAllComments(params: Map<String, String>): Map<String, Any> {
        val bookId = params["books_id"]?.toLongOrNull()
            ?: params["book_id"]?.toLongOrNull()
            ?: 0L
        val rows = jdbc.query(
            "SELECT * FROM tbl_comments WHERE book_id = ? ORDER BY id",
            { rs, _ ->
                val userImageRaw = rs.getString("user_image")
                val userType = try {
                    rs.getString("user_type").orEmpty()
                } catch (_: Exception) {
                    ""
                }
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
                    "user_image" to userImage,
                    "user_name" to rs.getString("user_name"),
                    "user_email" to (try {
                        rs.getString("user_email")
                    } catch (_: Exception) {
                        ""
                    } ?: ""),
                    "comment_text" to rs.getString("comment_text"),
                    "dt_rate" to formatDt(rs.getString("dt_rate") ?: rs.getString("comment_on")),
                    "comment_on" to (rs.getString("comment_on") ?: "")
                )
            },
            bookId
        )
        return EbookAppEnvelope.array(rows)
    }

    fun ratingCheck(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        val rate = jdbc.query(
            "SELECT rate FROM tbl_rating WHERE book_id = ? AND user_id = ? LIMIT 1",
            { rs, _ -> rs.getInt("rate") },
            bookId,
            userId
        ).firstOrNull()
        return if (rate == null) {
            EbookAppEnvelope.arrayOne(
                mapOf("MSG" to "Você ainda não avaliou", "sucess" to "0", "rate" to 0)
            )
        } else {
            EbookAppEnvelope.arrayOne(
                mapOf("MSG" to "Você já avaliou", "sucess" to "1", "rate" to rate)
            )
        }
    }

    fun submitRating(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        val rate = params["rate"]?.toIntOrNull() ?: 0
        if (rate !in 1..5) {
            return EbookAppEnvelope.arrayOne(
                mapOf("MSG" to "Avaliação inválida", "success" to "0")
            )
        }
        val existing = jdbc.query(
            "SELECT id FROM tbl_rating WHERE book_id = ? AND user_id = ? LIMIT 1",
            { rs, _ -> rs.getLong("id") },
            bookId,
            userId
        ).firstOrNull()
        val msg = if (existing != null) {
            jdbc.update(
                "UPDATE tbl_rating SET rate = ?, dt_rate = NOW() WHERE book_id = ? AND user_id = ?",
                rate, bookId, userId
            )
            "Avaliação atualizada com sucesso"
        } else {
            jdbc.update(
                "INSERT INTO tbl_rating (book_id, user_id, ip, rate, dt_rate) VALUES (?, ?, '', ?, NOW())",
                bookId, userId, rate
            )
            "Avaliação enviada com sucesso"
        }
        val stats = jdbc.query(
            "SELECT AVG(rate) AS avg_rate, COUNT(*) AS total_rates FROM tbl_rating WHERE book_id = ?",
            { rs, _ ->
                val avg = rs.getBigDecimal("avg_rate")?.setScale(1, RoundingMode.HALF_UP) ?: BigDecimal.ZERO
                avg to rs.getLong("total_rates")
            },
            bookId
        ).first()
        jdbc.update(
            "UPDATE tbl_books SET rate_avg = ?, total_rate = ? WHERE id = ?",
            stats.first.toPlainString(),
            stats.second,
            bookId
        )
        return EbookAppEnvelope.arrayOne(
            mapOf(
                "MSG" to msg,
                "success" to "1",
                "avg_rate" to stats.first.toPlainString(),
                "total_rates" to stats.second
            )
        )
    }

    fun toggleFavourite(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0 || bookId <= 0) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Parâmetros inválidos", "success" to "0", "is_favourite" to "0")
            )
        }
        val existing = jdbc.query(
            "SELECT id FROM tbl_favourite WHERE user_id = ? AND book_id = ? LIMIT 1",
            { rs, _ -> rs.getLong("id") },
            userId,
            bookId
        ).firstOrNull()
        return if (existing != null) {
            val n = jdbc.update("DELETE FROM tbl_favourite WHERE id = ?", existing)
            EbookAppEnvelope.arrayOne(
                if (n > 0) {
                    mapOf("msg" to "Removed from Favourite", "success" to "1", "is_favourite" to "0")
                } else {
                    mapOf("msg" to "Error in remove from Favourite", "success" to "0", "is_favourite" to "1")
                }
            )
        } else {
            jdbc.update("INSERT INTO tbl_favourite (book_id, user_id) VALUES (?, ?)", bookId, userId)
            EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Added to Favourite", "success" to "1", "is_favourite" to "1")
            )
        }
    }

    fun favouriteList(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0) return EbookAppEnvelope.array(emptyList())
        val rows = jdbc.query(
            "SELECT book_id FROM tbl_favourite WHERE user_id = ?",
            { rs, _ -> mapOf("book_id" to rs.getLong("book_id")) },
            userId
        )
        return EbookAppEnvelope.array(rows)
    }

    fun toggleWishlist(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        val bookId = params["book_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0 || bookId <= 0) {
            return EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Parâmetros inválidos", "success" to "0", "in_wishlist" to "0")
            )
        }
        val existing = jdbc.query(
            "SELECT id FROM tbl_wishlist WHERE user_id = ? AND book_id = ? LIMIT 1",
            { rs, _ -> rs.getLong("id") },
            userId,
            bookId
        ).firstOrNull()
        return if (existing != null) {
            jdbc.update("DELETE FROM tbl_wishlist WHERE id = ?", existing)
            EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Removido da lista Quero Ler", "success" to "1", "in_wishlist" to "0")
            )
        } else {
            jdbc.update("INSERT INTO tbl_wishlist (book_id, user_id) VALUES (?, ?)", bookId, userId)
            EbookAppEnvelope.arrayOne(
                mapOf("msg" to "Adicionado à lista Quero Ler", "success" to "1", "in_wishlist" to "1")
            )
        }
    }

    fun wishlistList(params: Map<String, String>): Map<String, Any> {
        val userId = params["user_id"]?.toLongOrNull() ?: 0L
        if (userId <= 0) return EbookAppEnvelope.array(emptyList())
        val rows = jdbc.query(
            "SELECT book_id FROM tbl_wishlist WHERE user_id = ?",
            { rs, _ -> mapOf("book_id" to rs.getLong("book_id")) },
            userId
        )
        return EbookAppEnvelope.array(rows)
    }

    private fun formatDt(raw: String?): String {
        if (raw.isNullOrBlank()) return ""
        return try {
            LocalDate.parse(raw.take(10)).format(DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH))
        } catch (_: Exception) {
            raw
        }
    }
}
