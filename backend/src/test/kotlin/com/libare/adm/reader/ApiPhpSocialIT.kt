package com.libare.adm.reader

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class ApiPhpSocialIT {
    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var jdbc: JdbcTemplate
    private val mapper = ObjectMapper()

    private var userId: Long = 0
    private var bookId: Long = 0
    private val email = "it.reader.social.${System.currentTimeMillis()}@local.dev"

    @BeforeEach
    fun seed() {
        jdbc.update(
            """
            INSERT INTO tbl_users
              (name, email, password, phone, user_type, user_image, auth_id, is_deleted, registered_on, status)
            VALUES (?, ?, 'x', '11999990000', 'Normal', '', '', 0, ?, '1')
            """.trimIndent(),
            "IT Social", email, System.currentTimeMillis().toString()
        )
        userId = jdbc.queryForObject("SELECT id FROM tbl_users WHERE email = ?", Long::class.java, email)!!

        // Reusa um livro existente se houver; senão cria mínimo
        bookId = jdbc.query(
            "SELECT id FROM tbl_books ORDER BY id DESC LIMIT 1",
            { rs, _ -> rs.getLong("id") }
        ).firstOrNull() ?: 0L

        if (bookId == 0L) {
            jdbc.update(
                """
                INSERT INTO tbl_books
                  (cat_id, aid, book_title, book_description, book_cover_img, book_file_type, book_file_url,
                   featured, status, total_rate, rate_avg, book_views)
                VALUES ('1', 1, 'IT Social Book', 'desc', '', 'local', '', 0, '1', 0, '0', 0)
                """.trimIndent()
            )
            bookId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
        }
    }

    @AfterEach
    fun tearDown() {
        if (userId > 0) {
            jdbc.update("DELETE FROM tbl_favourite WHERE user_id = ?", userId)
            jdbc.update("DELETE FROM tbl_wishlist WHERE user_id = ?", userId)
            jdbc.update("DELETE FROM tbl_rating WHERE user_id = ?", userId)
            jdbc.update("DELETE FROM tbl_reading WHERE user_id = ?", userId)
            jdbc.update("DELETE FROM tbl_book_page_notes WHERE user_id = ?", userId)
            jdbc.update("DELETE FROM tbl_comments WHERE user_id = ?", userId)
            jdbc.update("DELETE FROM tbl_users WHERE id = ?", userId)
        }
    }

    @Test
    fun `toggle_favourite add and remove`() {
        mockMvc.get("/api.php") {
            param("method_name", "toggle_favourite")
            param("user_id", userId.toString())
            param("book_id", bookId.toString())
        }.andExpect { status { isOk() } }

        val list = mockMvc.get("/api.php") {
            param("method_name", "favourite_list")
            param("user_id", userId.toString())
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        assertTrue(list.contains(bookId.toString()) || list.contains("\"book_id\""))

        mockMvc.get("/api.php") {
            param("method_name", "toggle_favourite")
            param("user_id", userId.toString())
            param("book_id", bookId.toString())
        }.andExpect { status { isOk() } }

        val after = mockMvc.get("/api.php") {
            param("method_name", "favourite_list")
            param("user_id", userId.toString())
        }.andReturn().response.contentAsString
        val arr = mapper.readTree(after).path("EBOOK_APP")
        assertTrue(arr.isArray)
        assertTrue(arr.none { it.path("book_id").asLong() == bookId })
    }

    @Test
    fun `submit_rating and rating_check`() {
        mockMvc.get("/api.php") {
            param("method_name", "submit_rating")
            param("user_id", userId.toString())
            param("book_id", bookId.toString())
            param("rate", "4")
        }.andExpect { status { isOk() } }

        val body = mockMvc.get("/api.php") {
            param("method_name", "rating_check")
            param("user_id", userId.toString())
            param("book_id", bookId.toString())
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val item = mapper.readTree(body).path("EBOOK_APP").path(0)
        assertEquals("1", item.path("sucess").asText())
        assertEquals(4, item.path("rate").asInt())
    }

    @Test
    fun `continue_reading upsert`() {
        val body = mockMvc.get("/api.php") {
            param("method_name", "continue_reading")
            param("con_user_id", userId.toString())
            param("con_book_id", bookId.toString())
            param("current_page", "3")
            param("total_pages", "100")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        assertEquals("1", mapper.readTree(body).path("EBOOK_APP").path(0).path("success").asText())
    }
}
