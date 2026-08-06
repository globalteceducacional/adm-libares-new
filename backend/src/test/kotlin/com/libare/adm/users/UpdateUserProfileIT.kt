package com.libare.adm.users

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import com.fasterxml.jackson.databind.JsonNode
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@SpringBootTest
@AutoConfigureMockMvc
class UpdateUserProfileIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val objectMapper = ObjectMapper()
    private val createdUserEmails = mutableListOf<String>()

    @AfterEach
    fun tearDown() {
        createdUserEmails.forEach { email ->
            jdbcTemplate.update("DELETE FROM tbl_users WHERE email = ?", email)
        }
        createdUserEmails.clear()
    }

    @Test
    fun `super admin updates user profile`() {
        val token = login("teste.admin", "Admin@123")
        val acervo = requireAcervoPair()
        val originalEmail = "it.update.profile.${System.currentTimeMillis()}@local.dev"
        val updatedEmail = "it.update.profile.new.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += originalEmail
        createdUserEmails += updatedEmail

        val created = createUser(
            token = token,
            schoolId = acervo.second,
            name = "IT Profile Original",
            email = originalEmail,
            password = "Secret@123",
            phone = "11988887777",
            acervoId = acervo.first
        )
        val userId = created.path("id").asLong()

        val passwordBefore = jdbcTemplate.queryForObject(
            "SELECT password FROM tbl_users WHERE id = ?",
            String::class.java,
            userId
        )

        val responseJson = mockMvc.put("/api/v1/users/$userId") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", acervo.second.toString())
            contentType = MediaType.APPLICATION_JSON
            content = updateBody(
                name = "IT Profile Updated",
                email = updatedEmail,
                phone = "11977776666"
            )
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val updated = objectMapper.readTree(responseJson)
        assertEquals(userId, updated.path("id").asLong())
        assertEquals("IT Profile Updated", updated.path("name").asText())
        assertEquals(updatedEmail, updated.path("email").asText())
        assertEquals("11977776666", updated.path("phone").asText())
        assertEquals(acervo.first.toLong(), updated.path("acervoId").asLong())
        assertEquals("1", updated.path("status").asText())

        val passwordAfter = jdbcTemplate.queryForObject(
            "SELECT password FROM tbl_users WHERE id = ?",
            String::class.java,
            userId
        )
        assertEquals(passwordBefore, passwordAfter, "Senha nao deve ser alterada no update de perfil")
    }

    @Test
    fun `update profile with duplicate email returns 400`() {
        val token = login("teste.admin", "Admin@123")
        val acervo = requireAcervoPair()
        val emailA = "it.update.profile.a.${System.currentTimeMillis()}@local.dev"
        val emailB = "it.update.profile.b.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += emailA
        createdUserEmails += emailB

        createUser(
            token = token,
            schoolId = acervo.second,
            name = "IT Profile A",
            email = emailA,
            password = "Secret@123",
            phone = "11988887777",
            acervoId = acervo.first
        )
        val userB = createUser(
            token = token,
            schoolId = acervo.second,
            name = "IT Profile B",
            email = emailB,
            password = "Secret@123",
            phone = "11988887778",
            acervoId = acervo.first
        )
        val userBId = userB.path("id").asLong()

        mockMvc.put("/api/v1/users/$userBId") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", acervo.second.toString())
            contentType = MediaType.APPLICATION_JSON
            content = updateBody(
                name = "IT Profile B",
                email = emailA,
                phone = "11988887778"
            )
        }.andExpect { status { isBadRequest() } }
    }

    @Test
    fun `update profile keeping same email succeeds`() {
        val token = login("teste.admin", "Admin@123")
        val acervo = requireAcervoPair()
        val email = "it.update.profile.same.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += email

        val created = createUser(
            token = token,
            schoolId = acervo.second,
            name = "IT Profile Same Email",
            email = email,
            password = "Secret@123",
            phone = "11988887777",
            acervoId = acervo.first
        )
        val userId = created.path("id").asLong()

        val responseJson = mockMvc.put("/api/v1/users/$userId") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", acervo.second.toString())
            contentType = MediaType.APPLICATION_JSON
            content = updateBody(
                name = "IT Profile Renamed Only",
                email = email,
                phone = "11988887777"
            )
        }
            .andExpect { status { isOk() } }
            .andReturn()
            .response
            .contentAsString

        val updated = objectMapper.readTree(responseJson)
        assertEquals("IT Profile Renamed Only", updated.path("name").asText())
        assertEquals(email, updated.path("email").asText())
        assertEquals("11988887777", updated.path("phone").asText())
    }

    private fun createUser(
        token: String,
        schoolId: Long,
        name: String,
        email: String,
        password: String,
        phone: String,
        acervoId: Int
    ): JsonNode {
        val responseJson = mockMvc.post("/api/v1/users") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", schoolId.toString())
            contentType = MediaType.APPLICATION_JSON
            content = createBody(name, email, password, phone, acervoId)
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString
        return objectMapper.readTree(responseJson)
    }

    private fun createBody(
        name: String,
        email: String,
        password: String,
        phone: String,
        acervoId: Int
    ): String = """
        {
          "name": "$name",
          "email": "$email",
          "password": "$password",
          "phone": "$phone",
          "acervoId": $acervoId,
          "status": "1"
        }
    """.trimIndent()

    private fun updateBody(
        name: String,
        email: String,
        phone: String
    ): String = """
        {
          "name": "$name",
          "email": "$email",
          "phone": "$phone"
        }
    """.trimIndent()

    private fun requireAcervoPair(): Pair<Int, Long> {
        val rows = jdbcTemplate.query(
            """
            SELECT id, school_id
            FROM acervos
            WHERE status = 1 AND school_id IS NOT NULL
            ORDER BY id ASC
            LIMIT 1
            """.trimIndent()
        ) { rs, _ -> rs.getInt("id") to rs.getLong("school_id") }
        require(rows.isNotEmpty()) { "Teste requer ao menos um acervo ativo com school_id" }
        return rows.first()
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
