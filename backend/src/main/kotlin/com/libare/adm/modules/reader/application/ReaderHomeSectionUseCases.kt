package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ReaderHomeSectionUseCases(
    private val jdbc: JdbcTemplate,
    private val acervo: ReaderAcervoFilter,
    private val mapper: ReaderBookRowMapper
) {
    fun homeSection(params: Map<String, String>): Map<String, Any> {
        val acervoId = acervo.resolve(params)
        val sections = jdbc.query(
            "SELECT * FROM tbl_home_section WHERE status = '1' OR status = 1 ORDER BY id DESC"
        ) { rs, _ ->
            val id = rs.getLong("id")
            val csv = rs.getString("section_books").orEmpty()
            var songList = allBookIdsForSection(id, csv)
            songList = acervo.filterBookIdsCsv(songList, acervoId)
            mapOf(
                "id" to id,
                "section_title" to rs.getString("section_title"),
                "song_list" to songList
            )
        }
        return EbookAppEnvelope.array(sections)
    }

    fun homeSectionId(params: Map<String, String>): Map<String, Any> {
        val sectionId = params["homesection_id"]?.toLongOrNull() ?: 0L
        val page = (params["page"]?.toIntOrNull() ?: 1).coerceAtLeast(1)
        val acervoId = acervo.resolve(params)

        val section = jdbc.query(
            "SELECT * FROM tbl_home_section WHERE (status = '1' OR status = 1) AND id = ? ORDER BY id DESC",
            { rs, _ -> rs.getString("section_books").orEmpty() },
            sectionId
        ).firstOrNull() ?: return EbookAppEnvelope.array(emptyList())

        var idsCsv = allBookIdsForSection(sectionId, section)
        idsCsv = acervo.filterBookIdsCsv(idsCsv, acervoId)
        if (idsCsv.isBlank()) return EbookAppEnvelope.array(emptyList())

        val ids = idsCsv.split(",").mapNotNull { it.trim().toLongOrNull() }
        if (ids.isEmpty()) return EbookAppEnvelope.array(emptyList())

        val placeholders = ids.joinToString(",") { "?" }
        val total = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM tbl_books
            WHERE id IN ($placeholders) AND (status = '1' OR status = 1)
            """.trimIndent(),
            Long::class.java,
            *ids.toTypedArray()
        ) ?: 0L

        val pageLimit = 10
        val offset = (page - 1) * pageLimit
        val listSql = """
            SELECT tbl_books.*, tbl_author.author_id, tbl_author.author_name, tbl_author.author_description,
                   tbl_category.cid, tbl_category.category_name, tbl_category.category_image
            FROM tbl_books
            LEFT JOIN tbl_category ON tbl_books.cat_id = tbl_category.cid
            LEFT JOIN tbl_author ON tbl_books.aid = tbl_author.author_id
            WHERE tbl_books.id IN ($placeholders) AND (tbl_books.status = '1' OR tbl_books.status = 1)
            ORDER BY tbl_books.id DESC
            LIMIT $pageLimit OFFSET $offset
        """.trimIndent()

        val books = jdbc.query(listSql, { rs, _ ->
            val row = mapper.mapBook(rs, includeFeatured = true, stripDescription = true)
            row.remove("aid")
            row["total_records"] = total
            row
        }, *ids.toTypedArray())

        return EbookAppEnvelope.array(books)
    }

    private fun allBookIdsForSection(sectionId: Long, sectionBooksCsv: String): String {
        val ids = linkedSetOf<Long>()
        sectionBooksCsv.split(",").forEach { part ->
            part.trim().toLongOrNull()?.takeIf { it > 0 }?.let { ids.add(it) }
        }
        try {
            val fromBooks = jdbc.query(
                """
                SELECT id FROM tbl_books
                WHERE (status = '1' OR status = 1)
                  AND section_ids IS NOT NULL AND section_ids <> ''
                  AND FIND_IN_SET(?, section_ids)
                """.trimIndent(),
                { rs, _ -> rs.getLong("id") },
                sectionId
            )
            ids.addAll(fromBooks)
        } catch (_: Exception) {
            // coluna section_ids pode não existir em dumps antigos
        }
        return ids.joinToString(",")
    }
}
