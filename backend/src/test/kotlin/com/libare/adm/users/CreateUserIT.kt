package com.libare.adm.users

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class CreateUserIT {
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
    fun `super admin creates user with school context and acervo`() {
        val token = login("teste.admin", "Admin@123")
        val acervo = requireAcervoPair()
        val email = "it.create.user.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += email

        val body = createBody(
            name = "IT Create User",
            email = email,
            password = "Secret@123",
            phone = "11988887777",
            acervoId = acervo.first
        )

        val responseJson = mockMvc.post("/api/v1/users") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", acervo.second.toString())
            contentType = MediaType.APPLICATION_JSON
            content = body
        }
            .andExpect { status { isCreated() } }
            .andReturn()
            .response
            .contentAsString

        val created = objectMapper.readTree(responseJson)
        assertTrue(created.path("id").asLong() > 0)
        assertEquals("IT Create User", created.path("name").asText())
        assertEquals(email, created.path("email").asText())
        assertEquals("Normal", created.path("userType").asText())
        assertEquals(acervo.first.toLong(), created.path("acervoId").asLong())
        assertFalse(responseJson.contains("password"), "Resposta nao deve expor password")

        val storedPassword = jdbcTemplate.queryForObject(
            "SELECT password FROM tbl_users WHERE email = ?",
            String::class.java,
            email
        )
        assertTrue(
            storedPassword.startsWith("\$2"),
            "Senha deve ser hash BCrypt, nao plaintext"
        )
    }

    @Test
    fun `create user without school context returns 400`() {
        val token = login("teste.admin", "Admin@123")
        val acervo = requireAcervoPair()
        val email = "it.create.user.noctx.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += email

        mockMvc.post("/api/v1/users") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = createBody(
                name = "IT No Context",
                email = email,
                password = "Secret@123",
                phone = "11988887777",
                acervoId = acervo.first
            )
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `create user with acervo from another school returns 403 or 400`() {
        val token = login("teste.admin", "Admin@123")
        val (schoolAId, schoolBId) = requireTwoSchools()
        val acervoSchoolB = requireAcervoForSchool(schoolBId)
        val email = "it.create.user.cross.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += email

        val result = mockMvc.post("/api/v1/users") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", schoolAId.toString())
            contentType = MediaType.APPLICATION_JSON
            content = createBody(
                name = "IT Cross School",
                email = email,
                password = "Secret@123",
                phone = "11988887777",
                acervoId = acervoSchoolB
            )
        }.andReturn()

        val status = result.response.status
        assertTrue(
            status == 403 || status == 400,
            "Esperado 403 ou 400 para acervo de outra escola, obtido $status: ${result.response.contentAsString}"
        )
    }

    @Test
    fun `create user with duplicate email returns 400`() {
        val token = login("teste.admin", "Admin@123")
        val acervo = requireAcervoPair()
        val email = "it.create.user.dup.${System.currentTimeMillis()}@local.dev"
        createdUserEmails += email

        val body = createBody(
            name = "IT Dup User",
            email = email,
            password = "Secret@123",
            phone = "11988887777",
            acervoId = acervo.first
        )

        mockMvc.post("/api/v1/users") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", acervo.second.toString())
            contentType = MediaType.APPLICATION_JSON
            content = body
        }.andExpect { status { isCreated() } }

        mockMvc.post("/api/v1/users") {
            header("Authorization", "Bearer $token")
            header("X-School-Context", acervo.second.toString())
            contentType = MediaType.APPLICATION_JSON
            content = body
        }.andExpect { status { isBadRequest() } }
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

    private fun requireTwoSchools(): Pair<Long, Long> {
        val schools = jdbcTemplate.queryForList(
            """
            SELECT DISTINCT school_id
            FROM acervos
            WHERE status = 1 AND school_id IS NOT NULL
            ORDER BY school_id ASC
            LIMIT 2
            """.trimIndent(),
            Long::class.java
        )
        require(schools.size >= 2) { "Teste requer acervos em ao menos duas escolas" }
        return schools[0] to schools[1]
    }

    private fun requireAcervoForSchool(schoolId: Long): Int {
        val id = jdbcTemplate.query(
            """
            SELECT id FROM acervos
            WHERE status = 1 AND school_id = ?
            ORDER BY id ASC
            LIMIT 1
            """.trimIndent(),
            { rs, _ -> rs.getInt(1) },
            schoolId
        ).firstOrNull()
        return id ?: error("Nenhum acervo ativo para school_id=$schoolId")
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
