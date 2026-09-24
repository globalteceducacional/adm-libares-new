package com.libare.adm.catalog

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

/**
 * PUT /api/v1/acervos/{id}/books — cria um acervo temporario e um livro temporario
 * para nao depender de dados existentes alem de um contrato ativo.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SyncAcervoBooksIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private var schoolId = 0L
    private var acervoId = 0L
    private var otherAcervoId = 0L
    private var bookId = 0L

    @BeforeEach
    fun setUp() {
        schoolId = jdbcTemplate.queryForList(
            "SELECT id FROM app_schools WHERE status = '1' ORDER BY id ASC LIMIT 1",
            Long::class.java
        ).firstOrNull() ?: error("Teste requer um contrato ativo")

        acervoId = insertAcervo("IT Sync Acervo A ${System.nanoTime()}")
        otherAcervoId = insertAcervo("IT Sync Acervo B ${System.nanoTime()}")

        jdbcTemplate.update(
            """
            INSERT INTO tbl_books
              (cat_id, aid, book_title, book_description, book_cover_img, book_file_type, book_file_url,
               featured, status, total_rate, rate_avg, book_views)
            VALUES ('1', 1, 'IT Sync Book', 'desc', '', 'local', '', 0, '1', 0, '0', 0)
            """.trimIndent()
        )
        bookId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
        // Livro comeca vinculado so ao acervo B (para testar "ultimo acervo").
        jdbcTemplate.update("INSERT INTO livros_acervos (book_id, acervo_id) VALUES (?, ?)", bookId, otherAcervoId)
    }

    @AfterEach
    fun tearDown() {
        jdbcTemplate.update("DELETE FROM livros_acervos WHERE book_id = ?", bookId)
        jdbcTemplate.update("DELETE FROM tbl_books WHERE id = ?", bookId)
        jdbcTemplate.update("DELETE FROM acervos WHERE id IN (?, ?)", acervoId, otherAcervoId)
    }

    @Test
    fun `add links book and remove unlinks when another acervo remains`() {
        val token = login("teste.admin", "Admin@123")

        val afterAdd = sync(token, acervoId, """{"add":[$bookId],"remove":[]}""")
            .andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        assertEquals(1L, objectMapper.readTree(afterAdd).path("bookCount").asLong())
        assertEquals(1L, countLinks(acervoId))

        // Idempotente: adicionar de novo nao duplica.
        sync(token, acervoId, """{"add":[$bookId],"remove":[]}""").andExpect { status { isOk() } }
        assertEquals(1L, countLinks(acervoId))

        val afterRemove = sync(token, acervoId, """{"add":[],"remove":[$bookId]}""")
            .andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        assertEquals(0L, objectMapper.readTree(afterRemove).path("bookCount").asLong())
        assertEquals(0L, countLinks(acervoId))
    }

    @Test
    fun `remove is refused when book would lose its last acervo`() {
        val token = login("teste.admin", "Admin@123")

        val body = sync(token, otherAcervoId, """{"add":[],"remove":[$bookId]}""")
            .andExpect { status { isBadRequest() } }
            .andReturn().response.contentAsString
        assertTrue(body.contains("sem acervo"), "Mensagem deve explicar o motivo: $body")
        assertEquals(1L, countLinks(otherAcervoId))
    }

    @Test
    fun `same book in add and remove returns 400`() {
        val token = login("teste.admin", "Admin@123")
        sync(token, acervoId, """{"add":[$bookId],"remove":[$bookId]}""")
            .andExpect { status { isBadRequest() } }
    }

    @Test
    fun `unknown book returns 400`() {
        val token = login("teste.admin", "Admin@123")
        sync(token, acervoId, """{"add":[999999999],"remove":[]}""")
            .andExpect { status { isBadRequest() } }
    }

    private fun sync(token: String, targetAcervoId: Long, body: String) =
        mockMvc.put("/api/v1/acervos/$targetAcervoId/books") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", schoolId.toString())
            contentType = MediaType.APPLICATION_JSON
            content = body
        }

    private fun insertAcervo(name: String): Long {
        jdbcTemplate.update(
            "INSERT INTO acervos (nome, descricao, status, school_id) VALUES (?, NULL, 1, ?)",
            name,
            schoolId
        )
        return jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
    }

    private fun countLinks(targetAcervoId: Long): Long =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM livros_acervos WHERE acervo_id = ?",
            Long::class.java,
            targetAcervoId
        ) ?: 0L

    private fun login(username: String, password: String): String {
        val loginJson = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"$username","password":"$password"}"""
        }.andReturn().response.contentAsString
        return Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
            ?: error("Login falhou para $username: $loginJson")
    }
}
