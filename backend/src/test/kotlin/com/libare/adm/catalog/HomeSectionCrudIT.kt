package com.libare.adm.catalog

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
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
class HomeSectionCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val createdSectionIds = mutableListOf<Int>()
    private val createdSectionTitles = mutableListOf<String>()
    private val bookSectionIdsBackup = mutableMapOf<Long, String?>()

    @AfterEach
    fun tearDown() {
        createdSectionIds.forEach { id ->
            jdbcTemplate.update("DELETE FROM tbl_home_section WHERE id = ?", id)
        }
        createdSectionTitles.forEach { title ->
            jdbcTemplate.update("DELETE FROM tbl_home_section WHERE section_title = ?", title)
        }
        bookSectionIdsBackup.forEach { (bookId, sectionIds) ->
            jdbcTemplate.update(
                "UPDATE tbl_books SET section_ids = ? WHERE id = ?",
                sectionIds,
                bookId
            )
        }
        createdSectionIds.clear()
        createdSectionTitles.clear()
        bookSectionIdsBackup.clear()
    }

    @Test
    fun `create section with book syncs section_books and book section_ids`() {
        val token = login("teste.admin", "Admin@123")
        val bookId = jdbcTemplate.queryForObject(
            "SELECT id FROM tbl_books WHERE status = '1' ORDER BY id DESC LIMIT 1",
            Long::class.java
        ) ?: error("Nenhum livro ativo no banco para o IT de secoes")

        bookSectionIdsBackup[bookId] = jdbcTemplate.query(
            "SELECT section_ids FROM tbl_books WHERE id = ?",
            { rs, _ -> rs.getString(1) },
            bookId
        ).firstOrNull()

        val uniqueTitle = "IT Secao ${System.currentTimeMillis()}"
        createdSectionTitles += uniqueTitle

        val createBody = """
            {
              "title": "$uniqueTitle",
              "bookIds": [$bookId],
              "status": "1"
            }
        """.trimIndent()

        val createJson = mockMvc.post("/api/v1/home-sections") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = createBody
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        val created = objectMapper.readTree(createJson)
        assertEquals(uniqueTitle, created.path("title").asText())
        assertEquals("1", created.path("status").asText())
        assertEquals(1, created.path("bookCount").asInt())
        assertEquals(bookId, created.path("bookIds").path(0).asLong())

        val createdSectionId = created.path("id").asInt()
        assertTrue(createdSectionId > 0, "Create deve retornar id > 0")
        createdSectionIds += createdSectionId

        val sectionBooks = jdbcTemplate.queryForObject(
            "SELECT section_books FROM tbl_home_section WHERE id = ?",
            String::class.java,
            createdSectionId
        )
        assertEquals(bookId.toString(), sectionBooks)

        val bookSectionIds = jdbcTemplate.query(
            "SELECT section_ids FROM tbl_books WHERE id = ?",
            { rs, _ -> rs.getString(1) },
            bookId
        ).firstOrNull().orEmpty()
        val parsedIds = bookSectionIds.split(",")
            .mapNotNull { it.trim().takeIf(String::isNotEmpty)?.toLongOrNull() }
        assertTrue(
            createdSectionId.toLong() in parsedIds,
            "section_ids do livro deve conter o id da secao ($createdSectionId). Atual=$bookSectionIds"
        )

        val listJson = mockMvc.get("/api/v1/home-sections") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val listed = findSectionInList(listJson, createdSectionId)
        assertNotNull(listed, "Lista deve conter a secao criada id=$createdSectionId")
        assertEquals(uniqueTitle, listed!!.path("title").asText())

        mockMvc.delete("/api/v1/home-sections/$createdSectionId") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val status = jdbcTemplate.queryForObject(
            "SELECT status FROM tbl_home_section WHERE id = ?",
            Int::class.java,
            createdSectionId
        )
        assertEquals(0, status, "Soft-delete deve gravar status = 0")
    }

    private fun findSectionInList(listJson: String, sectionId: Int): JsonNode? {
        val root = objectMapper.readTree(listJson)
        require(root.isArray) { "GET /home-sections deve retornar array JSON: $listJson" }
        return root.firstOrNull { it.path("id").asInt() == sectionId }
    }

    private fun login(username: String, password: String): String {
        val loginBody = """{"username":"$username","password":"$password"}"""
        val loginJson = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = loginBody
        }
            .andReturn()
            .response
            .contentAsString

        return Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
            ?: error("Login falhou para $username: $loginJson")
    }
}
