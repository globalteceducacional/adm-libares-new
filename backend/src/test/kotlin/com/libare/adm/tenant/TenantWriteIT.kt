package com.libare.adm.tenant

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import org.springframework.security.crypto.password.PasswordEncoder

@SpringBootTest
@AutoConfigureMockMvc
class TenantWriteIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private val testUsername = "it.school-a.write"
    private val testPassword = "School@123"
    private var schoolAId: Long = 0
    private var schoolBId: Long = 0
    private var schoolBUserId: Long = 0
    private var testAdminId: Long = 0

    @BeforeEach
    fun setUp() {
        val schools = jdbcTemplate.queryForList(
            "SELECT id FROM app_schools WHERE status = '1' ORDER BY id ASC LIMIT 2",
            Long::class.java
        )
        require(schools.size >= 2) { "Teste requer ao menos duas escolas no banco" }

        schoolAId = schools[0]
        schoolBId = schools[1]

        schoolBUserId = jdbcTemplate.queryForList(
            "SELECT id FROM tbl_users WHERE school_id = ? LIMIT 1",
            Long::class.java,
            schoolBId
        ).firstOrNull() ?: 0

        val passwordHash = passwordEncoder.encode(testPassword)
        jdbcTemplate.update(
            """
            INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
            VALUES (?, ?, ?, 'IT School A Write', '1', 0)
            ON DUPLICATE KEY UPDATE
                school_id = VALUES(school_id),
                password_hash = VALUES(password_hash),
                status = '1',
                is_super_admin = 0
            """.trimIndent(),
            schoolAId,
            testUsername,
            passwordHash
        )

        testAdminId = jdbcTemplate.queryForObject(
            "SELECT id FROM app_admin_users WHERE username = ?",
            Long::class.java,
            testUsername
        )

        val roleId = jdbcTemplate.queryForObject(
            "SELECT id FROM app_roles WHERE school_id = ? AND name = 'SCHOOL_ADMIN' LIMIT 1",
            Long::class.java,
            schoolAId
        )

        jdbcTemplate.update(
            "INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id) VALUES (?, ?)",
            testAdminId,
            roleId
        )

        jdbcTemplate.update(
            "INSERT IGNORE INTO app_admin_user_schools (admin_user_id, school_id) VALUES (?, ?)",
            testAdminId,
            schoolAId
        )
    }

    @AfterEach
    fun tearDown() {
        if (testAdminId > 0) {
            jdbcTemplate.update("DELETE FROM app_admin_user_schools WHERE admin_user_id = ?", testAdminId)
            jdbcTemplate.update("DELETE FROM app_admin_user_roles WHERE admin_user_id = ?", testAdminId)
            jdbcTemplate.update("DELETE FROM app_admin_users WHERE id = ?", testAdminId)
        }
    }

    @Test
    fun `school admin cannot update user from another school`() {
        if (schoolBUserId <= 0) {
            return
        }

        val token = login(testUsername, testPassword)
        val body = """{"status":"0"}"""

        mockMvc.put("/api/v1/users/$schoolBUserId/status") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = body
        }.andExpect {
            status { isForbidden() }
        }
    }

    @Test
    fun `super admin can list schools`() {
        val token = login("teste.admin", "Admin@123")

        mockMvc.get("/api/v1/schools") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
        }
    }

    @Test
    fun `school admin cannot list schools`() {
        val token = login(testUsername, testPassword)

        mockMvc.get("/api/v1/schools") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isForbidden() }
        }
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
