package com.libare.adm.tenant

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
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
import org.springframework.security.crypto.password.PasswordEncoder

@SpringBootTest
@AutoConfigureMockMvc
class TenantIsolationIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private val testUsername = "it.school-a.admin"
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
            VALUES (?, ?, ?, 'IT School A Admin', '1', 0)
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

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_admin_user_schools (admin_user_id, school_id)
            VALUES (?, ?)
            """.trimIndent(),
            testAdminId,
            schoolAId
        )
    }

    @AfterEach
    fun tearDown() {
        if (testAdminId > 0) {
            jdbcTemplate.update(
                "DELETE FROM app_admin_user_schools WHERE admin_user_id = ?",
                testAdminId
            )
            jdbcTemplate.update(
                "DELETE FROM app_admin_user_roles WHERE admin_user_id = ?",
                testAdminId
            )
            jdbcTemplate.update(
                "DELETE FROM app_admin_users WHERE id = ?",
                testAdminId
            )
        }
    }

    @Test
    fun `school admin does not list users from another school`() {
        val schoolBUserIds = jdbcTemplate.queryForList(
            """
            SELECT id FROM tbl_users
            WHERE school_id = ?
            LIMIT 20
            """.trimIndent(),
            Long::class.java,
            schoolBId
        )
        if (schoolBUserIds.isEmpty()) {
            return
        }

        val token = login(testUsername, testPassword)

        val response = mockMvc.get("/api/v1/users") {
            header("Authorization", "Bearer $token")
        }
            .andReturn()
            .response
            .contentAsString

        assertTrue(response.contains("["), "Resposta de usuarios deve ser um array JSON")

        schoolBUserIds.forEach { userId ->
            assertFalse(
                Regex(""""id"\s*:\s*$userId""").containsMatchIn(response),
                "Usuario $userId da escola B nao deve aparecer para admin da escola A"
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
