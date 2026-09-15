package com.libare.adm.modules.games.application

import com.libare.adm.modules.games.api.dto.GameResponse
import com.libare.adm.modules.games.api.dto.UpsertGameRequest
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class GamesCrudUseCase(
    private val jdbc: JdbcTemplate,
    private val authorizationService: AuthorizationService
) {
    fun list(): List<GameResponse> {
        authorizationService.check("games.view")
        ensureTable()
        return jdbc.query("SELECT * FROM Jogos ORDER BY id DESC") { rs, _ -> mapRow(rs) }
    }

    fun create(request: UpsertGameRequest): GameResponse {
        authorizationService.check("games.create")
        ensureTable()
        val title = request.title.trim()
        if (title.isEmpty() || request.fileUrl.trim().isEmpty()) {
            throw BadRequestException("Titulo e URL do jogo sao obrigatorios")
        }
        jdbc.update(
            """
            INSERT INTO Jogos (cat_id, aid, featured, book_title, book_description, book_cover_img, book_file_type, book_file_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            request.catId.trim().ifBlank { "0" },
            request.authorId,
            request.featured.coerceIn(0, 1),
            title,
            request.description,
            request.coverImage,
            request.fileType.ifBlank { "ludo_educativo" },
            request.fileUrl.trim(),
            request.status.coerceIn(0, 1)
        )
        val id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Int::class.java) ?: 0
        return findById(id)
    }

    fun update(id: Int, request: UpsertGameRequest): GameResponse {
        authorizationService.check("games.update")
        findById(id)
        jdbc.update(
            """
            UPDATE Jogos SET cat_id = ?, aid = ?, featured = ?, book_title = ?, book_description = ?,
                book_cover_img = ?, book_file_type = ?, book_file_url = ?, status = ?
            WHERE id = ?
            """.trimIndent(),
            request.catId.trim().ifBlank { "0" },
            request.authorId,
            request.featured.coerceIn(0, 1),
            request.title.trim(),
            request.description,
            request.coverImage,
            request.fileType.ifBlank { "ludo_educativo" },
            request.fileUrl.trim(),
            request.status.coerceIn(0, 1),
            id
        )
        return findById(id)
    }

    fun delete(id: Int) {
        authorizationService.check("games.delete")
        findById(id)
        jdbc.update("DELETE FROM Jogos WHERE id = ?", id)
    }

    private fun findById(id: Int): GameResponse {
        ensureTable()
        return jdbc.query("SELECT * FROM Jogos WHERE id = ?", { rs, _ -> mapRow(rs) }, id)
            .firstOrNull() ?: throw NotFoundException("Jogo nao encontrado")
    }

    private fun ensureTable() {
        val count = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'Jogos'
            """.trimIndent(),
            Int::class.java
        ) ?: 0
        if (count == 0) {
            throw BadRequestException("Tabela Jogos nao existe nesta base")
        }
    }

    private fun mapRow(rs: ResultSet): GameResponse =
        GameResponse(
            id = rs.getInt("id"),
            catId = rs.getString("cat_id").orEmpty(),
            authorId = rs.getInt("aid"),
            featured = rs.getInt("featured"),
            title = rs.getString("book_title").orEmpty(),
            description = rs.getString("book_description").orEmpty(),
            coverImage = rs.getString("book_cover_img").orEmpty(),
            fileType = rs.getString("book_file_type").orEmpty(),
            fileUrl = rs.getString("book_file_url").orEmpty(),
            views = rs.getInt("book_views"),
            status = rs.getInt("status")
        )
}
