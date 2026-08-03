package com.libare.adm.modules.reader.application

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

data class PasswordVerifyResult(val matches: Boolean, val needsUpgrade: Boolean)

/**
 * Verifica senha de leitor (tbl_users) e decide upgrade para BCrypt.
 * Aceita plaintext legado, BCrypt e Argon2 (upgrade Argon2 → BCrypt no sucesso).
 */
@Service
class ReaderPasswordService(
    private val passwordEncoder: PasswordEncoder
) {
    fun verifyAndDecideUpgrade(stored: String, raw: String): PasswordVerifyResult {
        if (stored.isBlank()) return PasswordVerifyResult(false, false)
        // Hash moderno (BCrypt $2*, Argon2, etc.)
        if (looksHashed(stored)) {
            val ok = passwordEncoder.matches(raw, stored)
            // Se for Argon2 e passou, ainda assim upgradear para BCrypt do projeto
            val needsUpgrade = ok && !stored.startsWith("\$2")
            return PasswordVerifyResult(ok, needsUpgrade)
        }
        // Plaintext legado
        val ok = stored == raw
        return PasswordVerifyResult(ok, needsUpgrade = ok)
    }

    fun encode(raw: String): String = passwordEncoder.encode(raw)

    private fun looksHashed(stored: String): Boolean =
        stored.startsWith("\$2") ||
            stored.startsWith("\$argon2") ||
            stored.startsWith("{bcrypt}") ||
            stored.startsWith("{argon2}")
}
