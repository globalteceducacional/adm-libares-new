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
import org.springframework.test.web.servlet.put

@SpringBootTest
@AutoConfigureMockMvc
class SiteCrudIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val siteIds = mutableListOf<Long>()
    private val authorIds = mutableListOf<Int>()
    private val categoryIds = mutableListOf<Int>()

    @AfterEach
    fun tearDown() {
        siteIds.forEach { id ->
            jdbcTemplate.update("DELETE FROM Comentarios_site WHERE book_id = ?", id)
            jdbcTemplate.update("DELETE FROM rating_sites WHERE book_id = ?", id)
            jdbcTemplate.update("DELETE FROM `vizualização_site` WHERE book_id = ?", id)
            jdbcTemplate.update("DELETE FROM Sites WHERE id = ?", id)
        }
        siteIds.clear()
        authorIds.forEach { jdbcTemplate.update("DELETE FROM Autores_site WHERE author_id = ?", it) }
        authorIds.clear()
        categoryIds.forEach { jdbcTemplate.update("DELETE FROM `Categoría_site` WHERE cid = ?", it) }
        categoryIds.clear()
    }

    @Test
    fun `create list update and delete site without touching tbl_books`() {
        val token = login("teste.admin", "Admin@123")
        val stamp = System.currentTimeMillis()

        jdbcTemplate.update(
            "INSERT INTO Autores_site (author_name, author_image, author_description, a_status) VALUES (?, ?, ?, ?)",
            "IT Site Author $stamp",
            "",
            "bio",
            1
        )
        val authorId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Int::class.java)!!
        authorIds += authorId

        jdbcTemplate.update(
            "INSERT INTO `Categoría_site` (category_name, category_image, cat_status) VALUES (?, ?, ?)",
            "IT Site Cat $stamp",
            "",
            1
        )
        val categoryId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Int::class.java)!!
        categoryIds += categoryId

        val booksBefore = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tbl_books", Int::class.java)!!
        val title = "IT Site $stamp"
        val body = """
            {
              "categoryIds": ["$categoryId"],
              "authorId": $authorId,
              "title": "$title",
              "description": "desc",
              "coverImage": "placeholder.jpg",
              "fileType": "server_url",
              "fileUrl": "https://example.com/a.pdf",
              "featured": "0",
              "status": "1"
            }
        """.trimIndent()

        val createdJson = mockMvc.post("/api/v1/sites") {
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
        siteIds += id

        mockMvc.get("/api/v1/sites") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isOk() } }

        val updateBody = """
            {
              "categoryIds": ["$categoryId"],
              "authorId": $authorId,
              "title": "$title updated",
              "description": "desc updated",
              "coverImage": "placeholder.jpg",
              "fileType": "server_url",
              "fileUrl": "https://example.com/b.pdf",
              "featured": "1",
              "status": "1"
            }
        """.trimIndent()

        mockMvc.put("/api/v1/sites/$id") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = updateBody
        }.andExpect { status { isOk() } }

        // Seed related Site-only rows when schema allows (cascade must clean them)
        val commentCols = jdbcTemplate.queryForList("SHOW COLUMNS FROM Comentarios_site")
            .mapNotNull { (it["Field"] as? String)?.lowercase() }
            .toSet()
        if (commentCols.containsAll(listOf("book_id", "user_name", "comment_text"))) {
            val cols = mutableListOf("book_id", "user_name", "comment_text")
            val vals = mutableListOf<Any>(id, "it", "comentario it")
            if ("user_id" in commentCols) {
                cols += "user_id"; vals += 1
            }
            if ("user_email" in commentCols) {
                cols += "user_email"; vals += "it@example.com"
            }
            if ("user_image" in commentCols) {
                cols += "user_image"; vals += ""
            }
            if ("user_type" in commentCols) {
                cols += "user_type"; vals += "Registered"
            }
            if ("dt_rate" in commentCols) {
                cols += "dt_rate"; vals += "2026-07-23"
            }
            if ("comment_on" in commentCols) {
                cols += "comment_on"; vals += "2026-07-23"
            }
            val placeholders = cols.joinToString(",") { "?" }
            jdbcTemplate.update(
                "INSERT INTO Comentarios_site (${cols.joinToString(",")}) VALUES ($placeholders)",
                *vals.toTypedArray()
            )
        }
        runCatching {
            jdbcTemplate.update(
                "INSERT INTO `vizualização_site` (user_id, book_id) VALUES (?, ?)",
                999001,
                id
            )
        }
        runCatching {
            jdbcTemplate.update(
                "INSERT INTO rating_sites (book_id, user_id) VALUES (?, ?)",
                id,
                1
            )
        }

        mockMvc.delete("/api/v1/sites/$id") {
            header("Authorization", "Bearer $token")
        }.andExpect { status { isNoContent() } }

        val remaining = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM Sites WHERE id = ?",
            Int::class.java,
            id
        )
        assertEquals(0, remaining, "Delete deve remover a row em Sites")

        val commentsLeft = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM Comentarios_site WHERE book_id = ?",
            Int::class.java,
            id
        )
        assertEquals(0, commentsLeft, "Cascata deve limpar Comentarios_site")

        val booksAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tbl_books", Int::class.java)!!
        assertEquals(booksBefore, booksAfter, "Delete de Site NAO pode alterar tbl_books")

        siteIds.remove(id)
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
