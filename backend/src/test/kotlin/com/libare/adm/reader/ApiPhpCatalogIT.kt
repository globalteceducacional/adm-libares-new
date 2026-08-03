package com.libare.adm.reader

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class ApiPhpCatalogIT {
    @Autowired
    private lateinit var mockMvc: MockMvc

    private val mapper = ObjectMapper()

    @Test
    fun `unknown method_name returns legacy fallback`() {
        val body = mockMvc.get("/api.php") {
            param("method_name", "nao_existe")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        val item = mapper.readTree(body).path("EBOOK_APP").path(0)
        assertEquals("1", item.path("success").asText())
        assertTrue(item.path("msg").asText().isNotBlank())
    }

    @Test
    fun `missing method_name returns legacy fallback`() {
        val body = mockMvc.get("/api.php")
            .andExpect { status { isOk() } }
            .andReturn().response.contentAsString

        assertEquals("1", mapper.readTree(body).path("EBOOK_APP").path(0).path("success").asText())
    }

    @Test
    fun `cat_list returns EBOOK_APP array`() {
        val body = mockMvc.get("/api.php") {
            param("method_name", "cat_list")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        assertTrue(mapper.readTree(body).has("EBOOK_APP"))
        assertTrue(mapper.readTree(body).path("EBOOK_APP").isArray)
    }

    @Test
    fun `home returns object with featured_books`() {
        val body = mockMvc.get("/api.php") {
            param("method_name", "home")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        val ebook = mapper.readTree(body).path("EBOOK_APP")
        assertTrue(ebook.isObject)
        assertTrue(ebook.has("featured_books"))
        assertTrue(ebook.has("latest_books"))
        assertTrue(ebook.has("popular_books"))
    }

    @Test
    fun `author_list returns EBOOK_APP array`() {
        val body = mockMvc.get("/api.php") {
            param("method_name", "author_list")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        assertTrue(mapper.readTree(body).path("EBOOK_APP").isArray)
    }

    @Test
    fun `home_section returns EBOOK_APP array`() {
        val body = mockMvc.get("/api.php") {
            param("method_name", "home_section")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        assertTrue(mapper.readTree(body).path("EBOOK_APP").isArray)
    }
}
