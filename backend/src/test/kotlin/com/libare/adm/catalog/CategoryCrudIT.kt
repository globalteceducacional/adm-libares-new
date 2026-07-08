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
class CategoryCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val createdCategoryIds = mutableListOf<Int>()
    private val createdCategoryNames = mutableListOf<String>()

    @AfterEach
    fun tearDown() {
        createdCategoryIds.forEach { id ->
            jdbcTemplate.update("DELETE FROM tbl_category WHERE cid = ?", id)
        }
        createdCategoryNames.forEach { name ->
            jdbcTemplate.update("DELETE FROM tbl_category WHERE category_name = ?", name)
        }
        createdCategoryIds.clear()
        createdCategoryNames.clear()
    }

    @Test
    fun `create list and soft-delete category`() {
        val token = login("teste.admin", "Admin@123")
        val uniqueName = "IT Cat ${System.currentTimeMillis()}"
        createdCategoryNames += uniqueName

        val createBody = """
            {
              "name": "$uniqueName",
              "image": "",
              "status": "1"
            }
        """.trimIndent()

        val createJson = mockMvc.post("/api/v1/categories") {
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
        assertEquals("1", created.path("status").asText())
        val createdCategoryId = created.path("id").asInt()
        assertTrue(createdCategoryId > 0, "Create deve retornar id > 0")
        createdCategoryIds += createdCategoryId

        val listJson = mockMvc.get("/api/v1/categories") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val listed = findCategoryInList(listJson, createdCategoryId)
        assertNotNull(listed, "Lista deve conter a categoria criada id=$createdCategoryId")
        assertEquals(uniqueName, listed!!.path("name").asText())
        assertEquals("1", listed.path("status").asText())

        mockMvc.delete("/api/v1/categories/$createdCategoryId") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val status = jdbcTemplate.queryForObject(
            "SELECT cat_status FROM tbl_category WHERE cid = ?",
            Int::class.java,
            createdCategoryId
        )
        assertEquals(0, status, "Soft-delete deve gravar cat_status = 0")

        val listAfterDelete = mockMvc.get("/api/v1/categories") {
            header("Authorization", "Bearer $token")
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val softDeleted = findCategoryInList(listAfterDelete, createdCategoryId)
        assertNotNull(softDeleted, "Lista pos-delete deve expor a categoria id=$createdCategoryId")
        assertEquals("0", softDeleted!!.path("status").asText(), "Categoria soft-deleted deve ter status 0 na lista")
        assertEquals(uniqueName, softDeleted.path("name").asText())
    }

    private fun findCategoryInList(listJson: String, categoryId: Int): JsonNode? {
        val root = objectMapper.readTree(listJson)
        require(root.isArray) { "GET /categories deve retornar array JSON: $listJson" }
        return root.firstOrNull { it.path("id").asInt() == categoryId }
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
