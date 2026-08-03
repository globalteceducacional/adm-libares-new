package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

/** Defaults alinhados a constantes típicas do PHP (tbl_settings). */
private const val API_LATEST_LIMIT = 10
private const val API_CAT_ORDER_BY = "DESC"
private const val API_CAT_POST_ORDER_BY = "DESC"
private const val API_AUTHOR_ORDER_BY = "author_id DESC"
private const val API_AUTHOR_POST_ORDER_BY = "DESC"

private const val BOOK_JOINS = """
    LEFT JOIN tbl_category ON tbl_books.cat_id = tbl_category.cid
    LEFT JOIN tbl_author ON tbl_books.aid = tbl_author.author_id
"""

@Service
class ReaderHomeUseCase(
    private val jdbc: JdbcTemplate,
    private val acervo: ReaderAcervoFilter,
    private val mapper: ReaderBookRowMapper
) {
    fun home(params: Map<String, String>): Map<String, Any> {
        val acervoId = acervo.resolve(params)
        val featured = queryBooks(
            "WHERE tbl_books.featured = 1",
            "ORDER BY tbl_books.id DESC",
            acervoId,
            catIdAsArray = true
        )
        val latest = queryBooks(
            "WHERE tbl_books.status = 1 OR tbl_books.status = '1'",
            "ORDER BY tbl_books.id DESC LIMIT 3",
            acervoId,
            catIdAsArray = true
        )
        val popular = queryBooks(
            "",
            "ORDER BY tbl_books.book_views DESC, tbl_books.total_rate DESC LIMIT 3",
            acervoId,
            catIdAsArray = true
        )
        return EbookAppEnvelope.obj(
            mapOf(
                "featured_books" to featured,
                "latest_books" to latest,
                "popular_books" to popular
            )
        )
    }

    private fun queryBooks(
        where: String,
        orderLimit: String,
        acervoId: Long?,
        catIdAsArray: Boolean
    ): List<Map<String, Any?>> {
        val join = acervo.joinAndClause(acervoId)
        val hasWhere = where.contains("WHERE", ignoreCase = true)
        val (acervoWhere, acervoArgs) = if (acervoId != null) {
            val prefix = if (hasWhere) " AND " else " WHERE "
            "${prefix}la.acervo_id = ?" to listOf<Any>(acervoId)
        } else {
            "" to emptyList()
        }
        val sql = """
            SELECT tbl_books.*, tbl_author.author_id, tbl_author.author_name, tbl_author.author_description,
                   tbl_category.cid, tbl_category.category_name, tbl_category.category_image
            FROM tbl_books $join $BOOK_JOINS
            $where $acervoWhere
            $orderLimit
        """.trimIndent()
        return jdbc.query(sql, { rs, _ -> mapper.mapBook(rs, catIdAsArray = catIdAsArray) }, *acervoArgs.toTypedArray())
    }
}

@Service
class ReaderCatalogListUseCases(
    private val jdbc: JdbcTemplate,
    private val acervo: ReaderAcervoFilter,
    private val mapper: ReaderBookRowMapper,
    private val urls: LegacyAssetUrlBuilder
) {
    fun catList(params: Map<String, String>): Map<String, Any> {
        val acervoId = acervo.resolve(params)
        val order = if (API_CAT_ORDER_BY.equals("ASC", true)) "ASC" else "DESC"
        val cats = jdbc.query(
            "SELECT * FROM tbl_category ORDER BY tbl_category.cid $order"
        ) { rs, _ ->
            val cid = rs.getObject("cid")
            val img = rs.getString("category_image")
            mapOf(
                "cid" to cid,
                "category_name" to rs.getString("category_name"),
                "category_image" to urls.images(img),
                "category_image_thumb" to urls.imageThumb(img),
                "total_books" to totalBooks(cid?.toString().orEmpty(), acervoId)
            )
        }
        return EbookAppEnvelope.array(cats)
    }

    fun catId(params: Map<String, String>): Map<String, Any> {
        val catId = params["cat_id"].orEmpty()
        val acervoId = acervo.resolve(params)
        return EbookAppEnvelope.array(
            listBooks(
                where = "WHERE tbl_books.cat_id = ?",
                whereArgs = listOf(catId),
                order = "ORDER BY tbl_books.id $API_CAT_POST_ORDER_BY",
                acervoId = acervoId
            )
        )
    }

    fun authorList(params: Map<String, String>): Map<String, Any> {
        val acervoId = acervo.resolve(params)
        val authors = if (acervoId == null) {
            jdbc.query("SELECT * FROM tbl_author ORDER BY $API_AUTHOR_ORDER_BY") { rs, _ ->
                mapAuthor(rs)
            }
        } else {
            jdbc.query(
                """
                SELECT DISTINCT tbl_author.* FROM tbl_author
                INNER JOIN tbl_books ON tbl_author.author_id = tbl_books.aid
                INNER JOIN livros_acervos la ON la.book_id = tbl_books.id
                WHERE la.acervo_id = ?
                ORDER BY $API_AUTHOR_ORDER_BY
                """.trimIndent(),
                { rs, _ -> mapAuthor(rs) },
                acervoId
            )
        }
        return EbookAppEnvelope.array(authors)
    }

    fun authorId(params: Map<String, String>): Map<String, Any> {
        val authorId = params["author_id"].orEmpty()
        val acervoId = acervo.resolve(params)
        return EbookAppEnvelope.array(
            listBooks(
                where = "WHERE tbl_books.aid = ?",
                whereArgs = listOf(authorId),
                order = "ORDER BY tbl_books.id $API_AUTHOR_POST_ORDER_BY",
                acervoId = acervoId,
                includeAuthorImage = true
            )
        )
    }

    fun latest(params: Map<String, String>): Map<String, Any> {
        val acervoId = acervo.resolve(params)
        return EbookAppEnvelope.array(
            listBooks(
                where = "",
                whereArgs = emptyList(),
                order = "ORDER BY tbl_books.id DESC LIMIT $API_LATEST_LIMIT",
                acervoId = acervoId
            )
        )
    }

    fun allBook(params: Map<String, String>): Map<String, Any> {
        val acervoId = acervo.resolve(params)
        return EbookAppEnvelope.array(
            listBooks(
                where = "",
                whereArgs = emptyList(),
                order = "ORDER BY tbl_books.id",
                acervoId = acervoId
            )
        )
    }

    fun searchText(params: Map<String, String>): Map<String, Any> {
        val q = params["search_text"].orEmpty()
        val acervoId = acervo.resolve(params)
        return EbookAppEnvelope.array(
            listBooks(
                where = "WHERE tbl_books.book_title LIKE ?",
                whereArgs = listOf("%$q%"),
                order = "ORDER BY tbl_books.book_title",
                acervoId = acervoId
            )
        )
    }

    private fun mapAuthor(rs: java.sql.ResultSet): Map<String, Any?> =
        mapOf(
            "author_id" to rs.getObject("author_id"),
            "author_name" to rs.getString("author_name"),
            "author_image" to rs.getString("author_image"),
            "author_description" to rs.getString("author_description")
        )

    private fun totalBooks(catId: String, acervoId: Long?): Any {
        if (catId.isBlank()) return 0
        return if (acervoId == null) {
            jdbc.queryForObject(
                "SELECT COUNT(DISTINCT tbl_books.id) FROM tbl_books WHERE cat_id LIKE ?",
                Long::class.java,
                "%$catId%"
            ) ?: 0
        } else {
            jdbc.queryForObject(
                """
                SELECT COUNT(DISTINCT tbl_books.id) FROM tbl_books
                WHERE cat_id LIKE ?
                  AND tbl_books.id IN (SELECT book_id FROM livros_acervos WHERE acervo_id = ?)
                """.trimIndent(),
                Long::class.java,
                "%$catId%",
                acervoId
            ) ?: 0
        }
    }

    private fun listBooks(
        where: String,
        whereArgs: List<Any>,
        order: String,
        acervoId: Long?,
        includeAuthorImage: Boolean = false
    ): List<Map<String, Any?>> {
        val join = acervo.joinAndClause(acervoId)
        val hasWhere = where.contains("WHERE", ignoreCase = true)
        val acervoSql = if (acervoId != null) {
            (if (hasWhere) " AND " else " WHERE ") + "la.acervo_id = ?"
        } else {
            ""
        }
        val sql = """
            SELECT tbl_books.*, tbl_author.author_id, tbl_author.author_name, tbl_author.author_description,
                   tbl_author.author_image,
                   tbl_category.cid, tbl_category.category_name, tbl_category.category_image
            FROM tbl_books $join $BOOK_JOINS
            $where $acervoSql
            $order
        """.trimIndent()
        val args = mutableListOf<Any>().apply {
            addAll(whereArgs)
            if (acervoId != null) add(acervoId)
        }
        return jdbc.query(sql, { rs, _ ->
            mapper.mapBook(
                rs,
                catIdAsArray = false,
                includeAuthorImage = includeAuthorImage,
                stripDescription = true
            )
        }, *args.toTypedArray())
    }
}
