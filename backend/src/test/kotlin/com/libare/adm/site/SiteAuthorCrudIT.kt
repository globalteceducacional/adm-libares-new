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
class SiteAuthorCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val ids = mutableListOf<Long>()

    @AfterEach
    fun tearDown() {
        ids.forEach { jdbcTemplate.update("DELETE FROM Autores_site WHERE author_id = ?", it) }
        ids.clear()
    }

    @Test
    fun `create list and soft-delete site author`() {
        val token = login("teste.admin", "Admin@123")
        val name = "IT Site Author ${System.currentTimeMillis()}"
        val body = """{"name":"$name","image":"","description":"bio","status":"1"}"""

        val createdJson = mockMvc.post("/api/v1/site-authors") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = body
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        val id = objectMapper.readTree(createdJson).path("id").asLong()
        assertTrue(id > 0)
        ids += id

        mockMvc.get("/api/v1/site-authors") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isOk() } }

        mockMvc.delete("/api/v1/site-authors/$id") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        // Task 0: coluna de status em Autores_site e a_status (INT no MySQL)
        val status = jdbcTemplate.queryForObject(
            "SELECT a_status FROM Autores_site WHERE author_id = ?",
            Int::class.java,
            id
        )
        assertEquals(0, status, "Soft-delete deve gravar a_status = 0")
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
