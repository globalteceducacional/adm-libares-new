package com.libare.adm.modules.reader.application

import org.springframework.stereotype.Component
import java.sql.ResultSet

/** Mapeia linhas livro+autor+categoria para o envelope do app. */
@Component
class ReaderBookRowMapper(
    private val urls: LegacyAssetUrlBuilder
) {
    fun mapBook(
        rs: ResultSet,
        catIdAsArray: Boolean = false,
        includeFeatured: Boolean = false,
        includeAuthorImage: Boolean = false,
        stripDescription: Boolean = false
    ): MutableMap<String, Any?> {
        val catRaw = rs.getString("cat_id").orEmpty()
        val cover = urls.resolve(rs.getString("book_cover_img").orEmpty(), "images")
        val fileUrl = urls.resolve(rs.getString("book_file_url").orEmpty(), "uploads")
        val catImage = rs.getString("category_image")
        val row = mutableMapOf<String, Any?>(
            "id" to rs.getLong("id"),
            "cat_id" to if (catIdAsArray) splitCsv(catRaw) else catRaw,
            "aid" to rs.getObject("aid"),
            "book_title" to rs.getString("book_title"),
            "book_cover_img" to cover,
            "book_file_type" to rs.getString("book_file_type"),
            "book_file_url" to fileUrl,
            "book_description" to if (stripDescription) {
                rs.getString("book_description")?.replace("\\'", "'")
            } else {
                rs.getString("book_description")
            },
            "total_rate" to rs.getObject("total_rate"),
            "rate_avg" to rs.getString("rate_avg"),
            "book_views" to rs.getObject("book_views"),
            "author_id" to rs.getObject("author_id"),
            "author_name" to rs.getString("author_name"),
            "author_description" to rs.getString("author_description"),
            "cid" to rs.getObject("cid"),
            "category_name" to rs.getString("category_name"),
            "category_image" to urls.images(catImage),
            "category_image_thumb" to urls.imageThumb(catImage)
        )
        if (includeFeatured) {
            row["featured"] = rs.getObject("featured")
        }
        if (includeAuthorImage) {
            row["author_image"] = rs.getString("author_image")
        }
        return row
    }

    fun mapRelated(rs: ResultSet): MutableMap<String, Any?> =
        mapBook(rs, catIdAsArray = false, includeFeatured = false)

    private fun splitCsv(raw: String): List<String> =
        if (raw.isBlank()) emptyList() else raw.split(",").map { it.trim() }.filter { it.isNotEmpty() }
}
