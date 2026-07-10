package com.libare.adm.auth

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class AuthRbacIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `super admin login returns permissions and me endpoint works`() {
        val loginBody = """{"username":"teste.admin","password":"Admin@123"}"""

        val loginResult = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = loginBody
        }
            .andReturn()

        val loginJson = loginResult.response.contentAsString
        assert(loginJson.contains("accessToken"))
        assert(loginJson.contains("permissions"))

        val token = Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
        require(!token.isNullOrBlank())

        mockMvc.get("/api/v1/auth/me") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            jsonPath("$.permissions") { isArray() }
            jsonPath("$.isSuperAdmin") { value(true) }
        }
    }
}
