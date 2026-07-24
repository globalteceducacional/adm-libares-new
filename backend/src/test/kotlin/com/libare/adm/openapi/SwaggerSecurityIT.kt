package com.libare.adm.openapi

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
class SwaggerSecurityIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `api-docs sem token retorna 401`() {
        mockMvc.get("/v3/api-docs")
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `swagger-ui sem token retorna 401`() {
        mockMvc.get("/swagger-ui/index.html")
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `api-docs com JWT admin retorna 200`() {
        val token = loginToken()
        mockMvc.get("/v3/api-docs") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith(MediaType.APPLICATION_JSON) }
        }
    }

    private fun loginToken(): String {
        val loginJson = mockMvc.post("/api/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"username":"teste.admin","password":"Admin@123"}"""
        }.andReturn().response.contentAsString
        val token = Regex(""""accessToken"\s*:\s*"([^"]+)"""").find(loginJson)?.groupValues?.get(1)
        require(!token.isNullOrBlank()) { "login falhou: $loginJson" }
        return token
    }
}
