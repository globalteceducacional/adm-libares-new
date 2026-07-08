package com.libare.adm.catalog

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
class AuthorCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val uniqueName = "IT Author ${System.currentTimeMillis()}"
    private var createdAuthorId: Long = 0

    @AfterEach
    fun tearDown() {
        if (createdAuthorId > 0) {
            jdbcTemplate.update("DELETE FROM tbl_author WHERE author_id = ?", createdAuthorId)
        } else {
            jdbcTemplate.update("DELETE FROM tbl_author WHERE author_name = ?", uniqueName)
        }
    }

    @Test
    fun `create list and soft-delete author`() {
        val token = login("teste.admin", "Admin@123")

        val createBody = """
            {
              "name": "$uniqueName",
              "image": "",
              "description": "Autor de teste IT",
              "status": "1"
            }
        """.trimIndent()

        val createJson = mockMvc.post("/api/v1/authors") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = createBody
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        assertTrue(createJson.contains(uniqueName), "Resposta de create deve conter o nome do autor")

        createdAuthorId = Regex(""""id"\s*:\s*(\d+)""").find(createJson)?.groupValues?.get(1)?.toLong()
            ?: error("Create nao retornou id: $createJson")

        val listJson = mockMvc.get("/api/v1/authors") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        assertTrue(listJson.contains(uniqueName), "Lista deve conter o autor criado")
        assertTrue(
            Regex(""""id"\s*:\s*$createdAuthorId""").containsMatchIn(listJson),
            "Lista deve conter o id $createdAuthorId"
        )

        mockMvc.delete("/api/v1/authors/$createdAuthorId") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val status = jdbcTemplate.queryForObject(
            "SELECT a_status FROM tbl_author WHERE author_id = ?",
            String::class.java,
            createdAuthorId
        )
        assertEquals("0", status, "Soft-delete deve gravar a_status = 0")

        val listAfterDelete = mockMvc.get("/api/v1/authors") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        assertTrue(
            listAfterDelete.contains(""""id":$createdAuthorId""") ||
                Regex(""""id"\s*:\s*$createdAuthorId[\s\S]*?"status"\s*:\s*"0"""").containsMatchIn(listAfterDelete) ||
                Regex(""""status"\s*:\s*"0"[\s\S]*?"id"\s*:\s*$createdAuthorId""").containsMatchIn(listAfterDelete) ||
                listAfterDelete.contains(uniqueName),
            "Lista pos-delete ainda deve expor o autor com status soft-deleted"
        )
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
