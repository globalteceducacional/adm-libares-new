package com.libare.adm.site

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class SiteCommentIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val commentIds = mutableListOf<Long>()
    private val siteIds = mutableListOf<Long>()

    @AfterEach
    fun tearDown() {
        commentIds.forEach { jdbcTemplate.update("DELETE FROM Comentarios_site WHERE id = ?", it) }
        commentIds.clear()
        siteIds.forEach { jdbcTemplate.update("DELETE FROM Sites WHERE id = ?", it) }
        siteIds.clear()
    }

    @Test
    fun `list contains jdbc-inserted comment and delete removes row`() {
        val token = login("teste.admin", "Admin@123")
        val marker = "IT SiteComment ${System.currentTimeMillis()}"

        // Minimal Sites row so book_id aponta para um site real
        jdbcTemplate.update(
            """
            INSERT INTO Sites (cat_id, aid, book_title, book_description, book_cover_img,
              book_file_type, book_file_url, featured, status, total_rate, rate_avg, book_views)
            VALUES ('1', 1, ?, 'desc', 'cover.jpg', 'server_url', 'https://example.com/a.pdf', 0, 1, 0, '0', 0)
            """.trimIndent(),
            "Site for $marker"
        )
        val siteId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
        siteIds += siteId

        jdbcTemplate.update(
            """
            INSERT INTO Comentarios_site
              (book_id, user_id, user_type, user_name, user_image, user_email, comment_text, comment_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            siteId,
            1,
            "Registered",
            "IT User",
            "",
            "it@example.com",
            marker,
            "2026-07-23"
        )
        val commentId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
        assertTrue(commentId > 0)
        commentIds += commentId

        val listJson = mockMvc.get("/api/v1/site-comments") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val list = objectMapper.readTree(listJson)
        assertTrue(list.isArray)
        val found = list.firstOrNull { it.path("id").asLong() == commentId }
            ?: error("Comentario $commentId nao encontrado na lista: $listJson")
        assertEquals(marker, found.path("commentText").asText())
        assertEquals(siteId, found.path("siteId").asLong())
        assertEquals("IT User", found.path("userName").asText())

        mockMvc.delete("/api/v1/site-comments/$commentId") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val remaining = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM Comentarios_site WHERE id = ?",
            Int::class.java,
            commentId
        )
        assertEquals(0, remaining, "Hard delete deve remover a row em Comentarios_site")
        commentIds.remove(commentId)
    }

    private fun login(username: String, password: String): String {
        val loginJson = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"$username","password":"$password"}"""
        }
            .andReturn()
            .response
            .contentAsString

        return Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
            ?: error("Login falhou para $username: $loginJson")
    }
}
