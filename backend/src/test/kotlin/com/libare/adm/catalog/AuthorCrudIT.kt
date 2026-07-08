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
import org.springframework.test.web.servlet.put

@SpringBootTest
@AutoConfigureMockMvc
class AuthorCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val createdAuthorIds = mutableListOf<Long>()
    private val createdAuthorNames = mutableListOf<String>()

    @AfterEach
    fun tearDown() {
        createdAuthorIds.forEach { id ->
            jdbcTemplate.update("DELETE FROM tbl_author WHERE author_id = ?", id)
        }
        createdAuthorNames.forEach { name ->
            jdbcTemplate.update("DELETE FROM tbl_author WHERE author_name = ?", name)
        }
        createdAuthorIds.clear()
        createdAuthorNames.clear()
    }

    @Test
    fun `create list and soft-delete author`() {
        val token = login("teste.admin", "Admin@123")
        val uniqueName = "IT Author ${System.currentTimeMillis()}"
        createdAuthorNames += uniqueName

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

        val created = objectMapper.readTree(createJson)
        assertEquals(uniqueName, created.path("name").asText())
        val createdAuthorId = created.path("id").asLong()
        assertTrue(createdAuthorId > 0, "Create deve retornar id > 0")
        createdAuthorIds += createdAuthorId

        val listJson = mockMvc.get("/api/v1/authors") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val listed = findAuthorInList(listJson, createdAuthorId)
        assertNotNull(listed, "Lista deve conter o autor criado id=$createdAuthorId")
        assertEquals(uniqueName, listed!!.path("name").asText())
        assertEquals("1", listed.path("status").asText())

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

        val softDeleted = findAuthorInList(listAfterDelete, createdAuthorId)
        assertNotNull(softDeleted, "Lista pos-delete deve expor o autor id=$createdAuthorId")
        assertEquals("0", softDeleted!!.path("status").asText(), "Autor soft-deleted deve ter status 0 na lista")
        assertEquals(uniqueName, softDeleted.path("name").asText())
    }

    @Test
    fun `update preserves description when omitted and when re-sent`() {
        val token = login("teste.admin", "Admin@123")
        val ts = System.currentTimeMillis()
        val originalName = "IT Author Bio $ts"
        val renamed = "IT Author Bio Renamed $ts"
        createdAuthorNames += originalName
        createdAuthorNames += renamed

        val createJson = mockMvc.post("/api/v1/authors") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "$originalName",
                  "image": "",
                  "description": "Bio Keep",
                  "status": "1"
                }
            """.trimIndent()
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        val authorId = objectMapper.readTree(createJson).path("id").asLong()
        createdAuthorIds += authorId

        // PUT renomeando e reenviando a mesma description
        val putResendJson = mockMvc.put("/api/v1/authors/$authorId") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "$renamed",
                  "image": "",
                  "description": "Bio Keep",
                  "status": "1"
                }
            """.trimIndent()
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val afterResend = objectMapper.readTree(putResendJson)
        assertEquals(renamed, afterResend.path("name").asText())
        assertEquals("Bio Keep", afterResend.path("description").asText())

        // PUT sem a chave description (Jackson → null) deve preservar a bio
        val putOmitJson = mockMvc.put("/api/v1/authors/$authorId") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "$renamed",
                  "image": "",
                  "status": "1"
                }
            """.trimIndent()
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val afterOmit = objectMapper.readTree(putOmitJson)
        assertEquals("Bio Keep", afterOmit.path("description").asText(), "Description omitida no PUT deve ser preservada")

        val dbDescription = jdbcTemplate.queryForObject(
            "SELECT author_description FROM tbl_author WHERE author_id = ?",
            String::class.java,
            authorId
        )
        assertEquals("Bio Keep", dbDescription)
    }

    @Test
    fun `create rejects duplicate author name with 400`() {
        val token = login("teste.admin", "Admin@123")
        val uniqueName = "IT Author Dup ${System.currentTimeMillis()}"
        createdAuthorNames += uniqueName

        val body = """
            {
              "name": "$uniqueName",
              "image": "",
              "description": "Primeiro",
              "status": "1"
            }
        """.trimIndent()

        val firstJson = mockMvc.post("/api/v1/authors") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = body
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        createdAuthorIds += objectMapper.readTree(firstJson).path("id").asLong()

        mockMvc.post("/api/v1/authors") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = body
        }.andExpect { status { isBadRequest() } }
    }

    private fun findAuthorInList(listJson: String, authorId: Long): JsonNode? {
        val root = objectMapper.readTree(listJson)
        require(root.isArray) { "GET /authors deve retornar array JSON: $listJson" }
        return root.firstOrNull { it.path("id").asLong() == authorId }
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
