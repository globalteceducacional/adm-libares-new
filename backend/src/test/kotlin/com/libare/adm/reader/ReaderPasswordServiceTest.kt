package com.libare.adm.reader

import com.libare.adm.modules.reader.application.ReaderPasswordService
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

class ReaderPasswordServiceTest {
    private val encoder = BCryptPasswordEncoder()
    private val service = ReaderPasswordService(encoder)

    @Test
    fun `plaintext match should upgrade`() {
        val r = service.verifyAndDecideUpgrade(stored = "Admin@123", raw = "Admin@123")
        assertTrue(r.matches)
        assertTrue(r.needsUpgrade)
    }

    @Test
    fun `bcrypt match should not upgrade`() {
        val hash = encoder.encode("Admin@123")
        val r = service.verifyAndDecideUpgrade(stored = hash, raw = "Admin@123")
        assertTrue(r.matches)
        assertFalse(r.needsUpgrade)
    }

    @Test
    fun `wrong password fails`() {
        val r = service.verifyAndDecideUpgrade(stored = "x", raw = "y")
        assertFalse(r.matches)
    }
}
