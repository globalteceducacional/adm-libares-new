package com.libare.adm.modules.site.reader

import org.springframework.beans.factory.annotation.Value
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.sql.ResultSet
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * Queries JDBC do espelho [api_sites.php]. Nomes de tabela Unicode exactos do legado.
 */
@Component
class SiteReaderQueries(
    private val jdbc: JdbcTemplate,
    @Value("\${app.legacy.public-base-url:http://localhost:8080}") private val publicBaseUrl: String
) {
    private val zone = ZoneId.of("America/Sao_Paulo")
    private val commentDateBookId = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)
    private val commentDateAll = DateTimeFormatter.ofPattern("d-MMM-yyyy", Locale.ENGLISH)

    private val bookJoinSql = """
        FROM Sites
        LEFT JOIN `Categoría_site` ON Sites.cat_id = `Categoría_site`.cid
        LEFT JOIN Autores_site ON Sites.aid = Autores_site.author_id
    """.trimIndent()

    fun imageUrl(filename: String?): String {
        val name = filename.orEmpty()
        val base = publicBaseUrl.trim().trimEnd('/')
        return "$base/legacy/assets/images/$name"
    }

    fun imageThumbUrl(filename: String?): String {
        val name = filename.orEmpty()
        val base = publicBaseUrl.trim().trimEnd('/')
        return "$base/legacy/assets/images/thumbs/$name"
    }

    fun uploadUrl(filename: String?): String {
        val name = filename.orEmpty()
        val base = publicBaseUrl.trim().trimEnd('/')
        return "$base/legacy/assets/uploads/$name"
    }

    fun loadApiSettings(): ApiOrderSettings {
        val rows = jdbc.query(
            """
            SELECT api_latest_limit, api_cat_order_by, api_cat_post_order_by,
                   api_author_order_by, api_author_post_order_by
            FROM tbl_settings WHERE id = 1
            """.trimIndent()
        ) { rs, _ ->
            ApiOrderSettings(
                latestLimit = rs.getObject("api_latest_limit")?.toString()?.toIntOrNull() ?: 10,
                catOrderBy = rs.getString("api_cat_order_by").orEmpty(),
                catPostOrderBy = rs.getString("api_cat_post_order_by").orEmpty(),
                authorOrderBy = rs.getString("api_author_order_by").orEmpty(),
                authorPostOrderBy = rs.getString("api_author_post_order_by").orEmpty()
            )
        }
        return rows.firstOrNull() ?: ApiOrderSettings()
    }

    fun home(): Map<String, Any> {
        val featured = jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.featured = 1 ORDER BY Sites.id DESC"
        ) { rs, _ -> mapBookRow(rs, explodeCatId = true) }

        val latest = jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.status = 1 ORDER BY Sites.id DESC LIMIT 3"
        ) { rs, _ -> mapBookRow(rs, explodeCatId = true) }

        val popular = jdbc.query(
            "SELECT * $bookJoinSql ORDER BY Sites.book_views DESC, Sites.total_rate DESC LIMIT 3"
        ) { rs, _ -> mapBookRow(rs, explodeCatId = true) }

        return linkedMapOf(
            "featured_books" to featured,
            "latest_books" to latest,
            "popular_books" to popular
        )
    }

    fun catList(): List<Map<String, Any?>> {
        val settings = loadApiSettings()
        val orderCol = whitelistColumn(settings.catOrderBy, setOf("cid", "category_name"), "cid")
        val rows = jdbc.query(
            "SELECT * FROM `Categoría_site` ORDER BY `Categoría_site`.$orderCol"
        ) { rs, _ ->
            val cid = rs.getObject("cid")
            val img = rs.getString("category_image")
            linkedMapOf<String, Any?>(
                "cid" to cid,
                "category_name" to rs.getString("category_name"),
                "category_image" to imageUrl(img),
                "category_image_thumb" to imageThumbUrl(img),
                "total_books" to countBooksByCatId(cid?.toString().orEmpty())
            )
        }
        return rows
    }

    fun catId(catId: String, orderDir: String): List<Map<String, Any?>> {
        val dir = whitelistAscDesc(orderDir)
        return jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.cat_id = ? ORDER BY Sites.id $dir",
            { rs, _ -> mapBookRow(rs) },
            catId
        )
    }

    fun authorList(): List<Map<String, Any?>> {
        val settings = loadApiSettings()
        val orderCol = whitelistColumn(settings.authorOrderBy, setOf("author_id", "author_name"), "author_id")
        return jdbc.query(
            "SELECT * FROM Autores_site ORDER BY Autores_site.$orderCol"
        ) { rs, _ ->
            linkedMapOf(
                "author_id" to rs.getObject("author_id"),
                "author_name" to rs.getString("author_name"),
                "author_image" to rs.getString("author_image"),
                "author_description" to rs.getString("author_description")
            )
        }
    }

    fun authorId(authorId: String, orderDir: String): List<Map<String, Any?>> {
        val dir = whitelistAscDesc(orderDir)
        return jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.aid = ? ORDER BY Sites.id $dir",
            { rs, _ -> mapBookRow(rs, includeAuthorImage = true) },
            authorId
        )
    }

    fun latest(limit: Int): List<Map<String, Any?>> {
        val safeLimit = limit.coerceIn(1, 500)
        return jdbc.query(
            "SELECT * $bookJoinSql ORDER BY Sites.id DESC LIMIT $safeLimit"
        ) { rs, _ -> mapBookRow(rs) }
    }

    fun allbook(): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * $bookJoinSql ORDER BY Sites.id"
        ) { rs, _ -> mapBookRow(rs) }
    }

    fun searchText(searchText: String): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.book_title LIKE ? ORDER BY Sites.book_title",
            { rs, _ -> mapBookRow(rs) },
            "%$searchText%"
        )
    }

    fun bookId(bookId: String): List<Map<String, Any?>> {
        val books = jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.id = ?",
            { rs, _ ->
                val row = mapBookRow(rs, includeFeatured = true)
                val catId = rs.getString("cat_id").orEmpty()
                row["related_books"] = relatedBooks(bookId, catId)
                row["user_comments"] = commentsForBookId(bookId)
                row
            },
            bookId
        )
        jdbc.update("UPDATE Sites SET book_views = book_views + 1 WHERE id = ?", bookId)
        return books
    }

    fun homeSection(): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * FROM `Seções_site` WHERE status = '1' ORDER BY `Seções_site`.`id` DESC"
        ) { rs, _ ->
            linkedMapOf(
                "id" to rs.getObject("id"),
                "section_title" to rs.getString("section_title"),
                "song_list" to rs.getString("section_books")
            )
        }
    }

    fun homeSectionId(sectionId: String, page: Int, orderDir: String): List<Map<String, Any?>> {
        val sections = jdbc.query(
            "SELECT * FROM `Seções_site` WHERE status = '1' AND `id` = ? ORDER BY `Seções_site`.`id` DESC",
            { rs, _ -> rs.getString("section_books").orEmpty() },
            sectionId
        )
        val songsIds = sections.firstOrNull()?.trim().orEmpty()
        if (songsIds.isBlank() || !songsIds.matches(Regex("^[0-9]+(,[0-9]+)*$"))) {
            return emptyList()
        }
        val total = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM Sites
            LEFT JOIN `Categoría_site` ON Sites.`cat_id` = `Categoría_site`.`cid`
            WHERE Sites.`id` IN ($songsIds) AND Sites.`status` = '1'
            """.trimIndent(),
            Int::class.java
        ) ?: 0

        val dir = whitelistAscDesc(orderDir)
        val pageLimit = 10
        val safePage = page.coerceAtLeast(1)
        val offset = (safePage - 1) * pageLimit

        return jdbc.query(
            """
            SELECT * $bookJoinSql
            WHERE Sites.`id` IN ($songsIds) AND Sites.`status` = '1'
            ORDER BY Sites.`id` $dir
            LIMIT $offset, $pageLimit
            """.trimIndent()
        ) { rs, _ ->
            // PHP home_section_id: total_records + livro sem aid.
            val row = mapBookRow(rs, includeFeatured = true, includeAid = false)
            linkedMapOf<String, Any?>("total_records" to total).apply { putAll(row) }
        }
    }

    fun getAllComments(booksId: String): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * FROM Comentarios_site WHERE book_id = ?",
            { rs, _ ->
                linkedMapOf(
                    "id" to rs.getObject("id"),
                    "book_id" to rs.getObject("book_id"),
                    "user_id" to rs.getObject("user_id"),
                    "user_image" to resolveUserImage(rs.getString("user_image"), rs.getString("user_type")),
                    "user_name" to rs.getString("user_name"),
                    "user_email" to rs.getString("user_email"),
                    "comment_text" to rs.getString("comment_text"),
                    "dt_rate" to formatCommentDate(rs, commentDateAll),
                    "comment_on" to rs.getString("comment_on")
                )
            },
            booksId
        )
    }

    fun removeComment(commentId: String): Boolean {
        val id = commentId.toLongOrNull() ?: 0L
        return jdbc.update("DELETE FROM Comentarios_site WHERE `id` = ?", id) >= 0
    }

    fun ratingCheck(userId: String, bookId: String): Boolean {
        val count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM rating_sites WHERE book_id = ? AND user_id = ?",
            Int::class.java,
            bookId,
            userId
        ) ?: 0
        return count > 0
    }

    fun continueReading(userId: String, bookId: String): Boolean {
        val existing = jdbc.queryForObject(
            "SELECT COUNT(*) FROM `vizualização_site` WHERE user_id = ?",
            Int::class.java,
            userId
        ) ?: 0
        return if (existing > 0) {
            jdbc.update(
                "UPDATE `vizualização_site` SET book_id = ? WHERE user_id = ?",
                bookId.toLongOrNull() ?: 0,
                userId.toLongOrNull() ?: 0
            ) >= 0
        } else {
            jdbc.update(
                "INSERT INTO `vizualização_site` (user_id, book_id) VALUES (?, ?)",
                userId,
                bookId
            ) >= 0
        }
    }

    fun continueReadingBook(userId: String): List<Map<String, Any?>> {
        val count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM `vizualização_site` WHERE user_id = ?",
            Int::class.java,
            userId
        ) ?: 0
        if (count <= 0) return emptyList()

        val bookId = jdbc.query(
            "SELECT book_id FROM `vizualização_site` WHERE user_id = ?",
            { rs, _ -> rs.getObject("book_id")?.toString() },
            userId
        ).firstOrNull() ?: return emptyList()

        return jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.id = ?",
            { rs, _ ->
                // PHP con_reding_book prefixa book_cover_img com images/.
                val row = mapBookRow(rs, includeFeatured = true)
                linkedMapOf<String, Any?>("user_id" to userId).apply {
                    putAll(row)
                    put("book_cover_img", imageUrl(rs.getString("book_cover_img")))
                }
            },
            bookId
        )
    }

    fun removeUser(userId: String): Boolean {
        val id = userId.toLongOrNull() ?: 0L
        return jdbc.update("DELETE FROM tbl_users WHERE `id` = ?", id) >= 0
    }

    fun deleteUserData(userId: String): DeleteUserResult {
        val id = userId.toLongOrNull() ?: 0L
        val count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM tbl_users WHERE id = ?",
            Int::class.java,
            id
        ) ?: 0
        if (count <= 0) return DeleteUserResult.NOT_FOUND
        jdbc.update("UPDATE tbl_users SET is_deleted = 1 WHERE `id` = ?", id)
        return DeleteUserResult.OK
    }

    fun appDetails(): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * FROM tbl_settings WHERE id = '1'"
        ) { rs, _ ->
            linkedMapOf(
                "app_name" to rs.getString("app_name"),
                "onesignal_rest_key" to rs.getString("onesignal_rest_key"),
                "onesignal_app_id" to rs.getString("onesignal_app_id"),
                "app_logo" to rs.getString("app_logo"),
                "app_version" to rs.getString("app_version"),
                "app_author" to rs.getString("app_author"),
                "app_contact" to rs.getString("app_contact"),
                "app_email" to rs.getString("app_email"),
                "app_website" to rs.getString("app_website"),
                "app_description" to rs.getString("app_description"),
                "publisher_id" to rs.getString("publisher_id"),
                // Typo legado do PHP — manter.
                "interstital_ad_id" to rs.getString("interstital_ad_id"),
                "interstital_ad_id_status" to rs.getObject("interstital_ad_id_status"),
                "banner_ad_id" to rs.getString("banner_ad_id"),
                "banner_ad_id_status" to rs.getObject("banner_ad_id_status"),
                "interstital_ad_id_ios" to rs.getString("interstital_ad_id_ios"),
                "interstital_ad_id_ios_status" to rs.getObject("interstital_ad_id_ios_status"),
                "banner_ad_id_ios" to rs.getString("banner_ad_id_ios"),
                "banner_ad_id_ios_status" to rs.getObject("banner_ad_id_ios_status"),
                "app_open_ad_id" to rs.getString("app_open_ad_id"),
                "app_open_ad_id_status" to rs.getObject("app_open_ad_id_status"),
                "ios_app_open_ad_id" to rs.getString("ios_app_open_ad_id"),
                "ios_app_open_ad_id_status" to rs.getObject("ios_app_open_ad_id_status"),
                "app_privacy_policy" to rs.getString("app_privacy_policy")
            )
        }
    }

    private fun relatedBooks(bookId: String, catId: String): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * $bookJoinSql WHERE Sites.id != ? AND Sites.cat_id = ?",
            { rs, _ -> mapBookRow(rs) },
            bookId,
            catId
        )
    }

    private fun commentsForBookId(bookId: String): List<Map<String, Any?>> {
        return jdbc.query(
            "SELECT * FROM Comentarios_site WHERE book_id = ? ORDER BY id",
            { rs, _ ->
                linkedMapOf(
                    "book_id" to rs.getObject("book_id"),
                    "user_name" to rs.getString("user_name"),
                    "comment_text" to rs.getString("comment_text"),
                    "user_image" to resolveUserImage(rs.getString("user_image"), rs.getString("user_type")),
                    "dt_rate" to formatCommentDate(rs, commentDateBookId)
                )
            },
            bookId
        )
    }

    private fun countBooksByCatId(catId: String): Int {
        return jdbc.queryForObject(
            "SELECT COUNT(*) FROM Sites WHERE cat_id = ?",
            Int::class.java,
            catId
        ) ?: 0
    }

    private fun mapBookRow(
        rs: ResultSet,
        explodeCatId: Boolean = false,
        includeFeatured: Boolean = false,
        includeAuthorImage: Boolean = false,
        includeAid: Boolean = true
    ): MutableMap<String, Any?> {
        val catRaw = rs.getString("cat_id")
        val catValue: Any? = if (explodeCatId) {
            catRaw?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList<String>()
        } else {
            catRaw
        }
        val catImg = rs.getString("category_image")
        val ordered = linkedMapOf<String, Any?>()
        ordered["id"] = rs.getObject("id")
        ordered["cat_id"] = catValue
        if (includeAid) {
            ordered["aid"] = rs.getObject("aid")
        }
        if (includeFeatured) {
            ordered["featured"] = rs.getObject("featured")
        }
        ordered["book_title"] = rs.getString("book_title")
        // PHP home featured/latest: cover antes de description; book_id/popular: description antes.
        // Mantemos description apos cover (maioria dos methods) e popular sobrescreve ordem no JSON livre.
        ordered["book_cover_img"] = rs.getString("book_cover_img")
        ordered["book_file_type"] = rs.getString("book_file_type")
        ordered["book_file_url"] = rs.getString("book_file_url")
        ordered["book_description"] = rs.getString("book_description")
        ordered["total_rate"] = rs.getObject("total_rate")
        ordered["rate_avg"] = rs.getString("rate_avg")
        ordered["book_views"] = rs.getObject("book_views")
        ordered["author_id"] = rs.getObject("author_id")
        ordered["author_name"] = rs.getString("author_name")
        if (includeAuthorImage) {
            ordered["author_image"] = rs.getString("author_image")
        }
        ordered["author_description"] = rs.getString("author_description")
        ordered["cid"] = rs.getObject("cid")
        ordered["category_name"] = rs.getString("category_name")
        ordered["category_image"] = imageUrl(catImg)
        ordered["category_image_thumb"] = imageThumbUrl(catImg)
        return ordered
    }

    private fun resolveUserImage(userImage: String?, userType: String?): String {
        if (userImage.isNullOrBlank()) {
            return imageUrl("add-image.png")
        }
        if (userType == "Google" || userType == "Facebook") {
            return userImage
        }
        return imageUrl(userImage)
    }

    private fun formatCommentDate(rs: ResultSet, formatter: DateTimeFormatter): String {
        val ts = rs.getTimestamp("dt_rate") ?: return ""
        return formatter.format(ts.toInstant().atZone(zone))
    }

    private fun whitelistAscDesc(value: String): String =
        if (value.equals("ASC", ignoreCase = true)) "ASC" else "DESC"

    private fun whitelistColumn(value: String, allowed: Set<String>, default: String): String {
        val trimmed = value.trim()
        return if (trimmed in allowed) trimmed else default
    }

    data class ApiOrderSettings(
        val latestLimit: Int = 10,
        val catOrderBy: String = "cid",
        val catPostOrderBy: String = "DESC",
        val authorOrderBy: String = "author_id",
        val authorPostOrderBy: String = "DESC"
    )

    enum class DeleteUserResult { OK, NOT_FOUND }
}
