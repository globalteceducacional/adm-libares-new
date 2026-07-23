package com.libare.adm.site

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class ApiSitesIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    private val objectMapper = ObjectMapper()

    @Test
    fun `home returns Galileu envelope without auth`() {
        val body = mockMvc.get("/api_sites.php") {
            param("method_name", "home")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        val root = objectMapper.readTree(body)
        assertTrue(root.has("Galileu"), "Envelope deve ser Galileu")
    }

    @Test
    fun `cat_list returns Galileu array`() {
        val body = mockMvc.get("/api_sites.php") {
            param("method_name", "cat_list")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        assertTrue(objectMapper.readTree(body).has("Galileu"))
    }

    @Test
    fun `unknown method returns Galileu msg`() {
        val body = mockMvc.get("/api_sites.php") {
            param("method_name", "nao_existe")
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        val arr = objectMapper.readTree(body).path("Galileu")
        assertTrue(arr.isArray && arr.size() > 0)
        assertTrue(arr[0].has("msg"))
    }
}
