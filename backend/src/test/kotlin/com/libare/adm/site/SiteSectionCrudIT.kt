package com.libare.adm.site

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
class SiteSectionCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val ids = mutableListOf<Int>()

    @AfterEach
    fun tearDown() {
        ids.forEach { jdbcTemplate.update("DELETE FROM `Seções_site` WHERE id = ?", it) }
        ids.clear()
    }

    @Test
    fun `create with empty siteIds list and soft-delete site section`() {
        val token = login("teste.admin", "Admin@123")
        val title = "IT Site Secao ${System.currentTimeMillis()}"
        val body = """{"title":"$title","siteIds":[],"status":"1"}"""

        val createdJson = mockMvc.post("/api/v1/site-sections") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = body
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        val created = objectMapper.readTree(createdJson)
        val id = created.path("id").asInt()
        assertTrue(id > 0)
        ids += id
        assertEquals(title, created.path("title").asText())
        assertEquals("1", created.path("status").asText())
        assertTrue(created.path("siteIds").isArray)
        assertEquals(0, created.path("siteIds").size())

        val sectionBooks = jdbcTemplate.queryForObject(
            "SELECT section_books FROM `Seções_site` WHERE id = ?",
            String::class.java,
            id
        )
        assertTrue(sectionBooks.isNullOrBlank(), "siteIds vazio deve persistir CSV vazio")

        val listJson = mockMvc.get("/api/v1/site-sections") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val listed = findInList(listJson, id)
        assertNotNull(listed, "Lista deve conter a secao criada id=$id")
        assertEquals(title, listed!!.path("title").asText())

        mockMvc.delete("/api/v1/site-sections/$id") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val status = jdbcTemplate.queryForObject(
            "SELECT status FROM `Seções_site` WHERE id = ?",
            Int::class.java,
            id
        )
        assertEquals(0, status, "Soft-delete deve gravar status = 0")
    }

    private fun findInList(listJson: String, sectionId: Int): JsonNode? {
        val root = objectMapper.readTree(listJson)
        require(root.isArray) { "GET /site-sections deve retornar array JSON: $listJson" }
        return root.firstOrNull { it.path("id").asInt() == sectionId }
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
