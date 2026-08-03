package com.libare.adm.reader

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class UserRegisterIT {
    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var jdbc: JdbcTemplate
    private val mapper = ObjectMapper()
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
    fun `register normal hashes password and login works`() {
        val email = "it.reader.reg.${System.currentTimeMillis()}@local.dev"
        emails += email
        val regBody = mockMvc.get("/user_register_api.php") {
            param("type", "Normal")
            param("name", "Reg User")
            param("email", email)
            param("password", "Secret@123")
            param("phone", "11988887777")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val regItem = mapper.readTree(regBody).path("EBOOK_APP").path(0)
        assertEquals("1", regItem.path("success").asText())

        val hash = jdbc.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )!!
        assertTrue(hash.startsWith("\$2"))

        val loginBody = mockMvc.get("/user_login_api.php") {
            param("email", email)
            param("password", "Secret@123")
            param("type", "Normal")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        assertEquals("1", mapper.readTree(loginBody).path("EBOOK_APP").path(0).path("success").asText())
    }

    @Test
    fun `profile returns user fields`() {
        val email = "it.reader.prof.${System.currentTimeMillis()}@local.dev"
        emails += email
        mockMvc.get("/user_register_api.php") {
            param("type", "Normal")
            param("name", "Prof User")
            param("email", email)
            param("password", "Secret@123")
            param("phone", "11977776666")
            param("auth_id", "")
        }.andExpect { status { isOk() } }

        val userId = jdbc.queryForObject(
            "SELECT id FROM tbl_users WHERE email = ?",
            Long::class.java,
            email
        )!!

        val body = mockMvc.get("/user_profile_api.php") {
            param("id", userId.toString())
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val item = mapper.readTree(body).path("EBOOK_APP").path(0)
        assertEquals("1", item.path("success").asText())
        assertEquals("Prof User", item.path("name").asText())
        assertEquals(email, item.path("email").asText())
    }

    @Test
    fun `profile update changes name and optional password`() {
        val email = "it.reader.upd.${System.currentTimeMillis()}@local.dev"
        emails += email
        mockMvc.get("/user_register_api.php") {
            param("type", "Normal")
            param("name", "Old Name")
            param("email", email)
            param("password", "Secret@123")
            param("phone", "11966665555")
            param("auth_id", "")
        }.andExpect { status { isOk() } }

        val userId = jdbc.queryForObject(
            "SELECT id FROM tbl_users WHERE email = ?",
            Long::class.java,
            email
        )!!

        mockMvc.post("/user_profile_update_api.php") {
            param("user_id", userId.toString())
            param("name", "New Name")
            param("email", email)
            param("password", "NewSecret@456")
            param("phone", "11966665555")
        }.andExpect { status { isOk() } }

        val name = jdbc.queryForObject(
            "SELECT name FROM tbl_users WHERE id = ?",
            String::class.java,
            userId
        )
        assertEquals("New Name", name)

        val loginBody = mockMvc.get("/user_login_api.php") {
            param("email", email)
            param("password", "NewSecret@456")
            param("type", "Normal")
            param("auth_id", "")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        assertEquals("1", mapper.readTree(loginBody).path("EBOOK_APP").path(0).path("success").asText())
    }

    @Test
    fun `forgot password resets hash and does not leak password in json`() {
        val email = "it.reader.forgot.${System.currentTimeMillis()}@local.dev"
        emails += email
        mockMvc.get("/user_register_api.php") {
            param("type", "Normal")
            param("name", "Forgot User")
            param("email", email)
            param("password", "Secret@123")
            param("phone", "11955554444")
            param("auth_id", "")
        }.andExpect { status { isOk() } }

        val before = jdbc.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )!!

        val body = mockMvc.get("/user_forgot_pass_api.php") {
            param("email", email)
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val item = mapper.readTree(body).path("EBOOK_APP").path(0)
        assertEquals("1", item.path("success").asText())
        assertTrue(item.path("msg").asText().isNotBlank())
        assertTrue(item.path("password").isMissingNode || item.path("password").asText().isBlank())

        val after = jdbc.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )!!
        assertTrue(after.startsWith("\$2"))
        assertTrue(after != before)
    }
}
