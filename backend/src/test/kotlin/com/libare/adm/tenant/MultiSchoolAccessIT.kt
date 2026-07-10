package com.libare.adm.tenant

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class MultiSchoolAccessIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private val testUsername = "it.multi.school.admin"
    private val testPassword = "School@123"
    private var schoolAId: Long = 0
    private var schoolBId: Long = 0
    private var testAdminId: Long = 0

    @BeforeEach
    fun setUp() {
        val schools = jdbcTemplate.queryForList(
            """
            SELECT id FROM app_schools
            WHERE status = '1'
            ORDER BY id ASC
            LIMIT 2
            """.trimIndent(),
            Long::class.java
        )
        require(schools.size >= 2) { "Teste requer ao menos duas escolas no banco" }

        schoolAId = schools[0]
        schoolBId = schools[1]

        val passwordHash = passwordEncoder.encode(testPassword)
        jdbcTemplate.update(
            """
            INSERT INTO app_admin_users (school_id, username, password_hash, name, status, is_super_admin)
            VALUES (?, ?, ?, 'IT Multi School Admin', '1', 0)
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

        jdbcTemplate.update("DELETE FROM app_admin_user_schools WHERE admin_user_id = ?", testAdminId)
        jdbcTemplate.update(
            "INSERT INTO app_admin_user_schools (admin_user_id, school_id) VALUES (?, ?), (?, ?)",
            testAdminId,
            schoolAId,
            testAdminId,
            schoolBId
        )

        val roleId = jdbcTemplate.queryForObject(
            """
            SELECT id FROM app_roles
            WHERE school_id = ? AND name = 'SCHOOL_ADMIN'
            LIMIT 1
            """.trimIndent(),
            Long::class.java,
            schoolAId
        )

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_admin_user_roles (admin_user_id, role_id)
            VALUES (?, ?)
            """.trimIndent(),
            testAdminId,
            roleId
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
    fun `multi school admin auth me lists both schools and requires context`() {
        val token = login(testUsername, testPassword)

        mockMvc.get("/api/v1/auth/me") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            jsonPath("$.requiresSchoolContext") { value(true) }
            jsonPath("$.allowedSchools.length()") { value(2) }
        }
    }

    @Test
    fun `multi school admin can list acervos from selected school context`() {
        val token = login(testUsername, testPassword)

        val response = mockMvc.get("/api/v1/acervos") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", schoolAId.toString())
        }
            .andReturn()
            .response
            .contentAsString

        assertTrue(response.contains("["), "Resposta de acervos deve ser um array JSON")

        val schoolBAcervoIds = jdbcTemplate.queryForList(
            "SELECT id FROM acervos WHERE school_id = ?",
            Long::class.java,
            schoolBId
        )
        schoolBAcervoIds.forEach { acervoId ->
            assertEquals(
                false,
                Regex(""""id"\s*:\s*$acervoId""").containsMatchIn(response),
                "Acervo $acervoId da escola B nao deve aparecer com contexto da escola A"
            )
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
