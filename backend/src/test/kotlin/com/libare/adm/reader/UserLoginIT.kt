package com.libare.adm.reader

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class UserLoginIT {
    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var jdbc: JdbcTemplate
    private val mapper = ObjectMapper()
    private val encoder = BCryptPasswordEncoder()
    private val emails = mutableListOf<String>()

    @AfterEach
    fun tearDown() {
        emails.forEach { e ->
            jdbc.update(
                "DELETE FROM tbl_active_log WHERE user_id IN (SELECT id FROM tbl_users WHERE email = ?)",
                e
            )
            jdbc.update("DELETE FROM tbl_users WHERE email = ?", e)
        }
        emails.clear()
    }

    @Test
    fun `normal login upgrades plaintext password`() {
        val email = "it.reader.login.${System.currentTimeMillis()}@local.dev"
        emails += email
        jdbc.update(
            """
            INSERT INTO tbl_users
              (name, email, password, phone, user_type, user_image, auth_id, is_deleted, registered_on, status)
            VALUES (?, ?, ?, ?, 'Normal', '', '', 0, ?, '1')
            """.trimIndent(),
            "IT Reader", email, "PlainPass1", "11999990000", System.currentTimeMillis().toString()
        )

        val body = mockMvc.get("/user_login_api.php") {
            param("email", email)
            param("password", "PlainPass1")
            param("type", "Normal")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val root = mapper.readTree(body)
        val item = root.path("EBOOK_APP").path(0)
        assertEquals("1", item.path("success").asText())
        assertTrue(item.path("user_id").asLong() > 0)

        val stored = jdbc.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )!!
        assertTrue(stored.startsWith("\$2"), "deve ter virado BCrypt")
    }

    @Test
    fun `normal login accepts bcrypt without upgrade`() {
        val email = "it.reader.bcrypt.${System.currentTimeMillis()}@local.dev"
        emails += email
        val hash = encoder.encode("BcryptPass1")
        jdbc.update(
            """
            INSERT INTO tbl_users
              (name, email, password, phone, user_type, user_image, auth_id, is_deleted, registered_on, status)
            VALUES (?, ?, ?, ?, 'Normal', '', '', 0, ?, '1')
            """.trimIndent(),
            "IT Bcrypt", email, hash, "11999990001", System.currentTimeMillis().toString()
        )

        val body = mockMvc.get("/user_login_api.php") {
            param("email", email)
            param("password", "BcryptPass1")
            param("type", "Normal")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val item = mapper.readTree(body).path("EBOOK_APP").path(0)
        assertEquals("1", item.path("success").asText())

        val stored = jdbc.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )!!
        assertEquals(hash, stored)
        assertFalse(encoder.matches("wrong", stored))
    }

    @Test
    fun `wrong password returns success 0`() {
        val email = "it.reader.bad.${System.currentTimeMillis()}@local.dev"
        emails += email
        jdbc.update(
            """
            INSERT INTO tbl_users
              (name, email, password, phone, user_type, user_image, auth_id, is_deleted, registered_on, status)
            VALUES (?, ?, ?, ?, 'Normal', '', '', 0, ?, '1')
            """.trimIndent(),
            "IT Bad", email, "Secret1", "11999990002", System.currentTimeMillis().toString()
        )

        val body = mockMvc.get("/user_login_api.php") {
            param("email", email)
            param("password", "wrong")
            param("type", "Normal")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val item = mapper.readTree(body).path("EBOOK_APP").path(0)
        assertEquals("0", item.path("success").asText())
    }
}
