package com.libare.adm.shared.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${app.security.jwt-secret}") private val jwtSecret: String,
    @Value("\${app.security.jwt-expiration-minutes}") private val expirationMinutes: Long
) {
    companion object {
        private const val ROLE_CLAIM = "role"
    }

    private val signingKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret))
    }

    fun generateToken(subject: String, role: String): String {
        val now = Instant.now()
        val expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES)

        return Jwts.builder()
            .subject(subject)
            .claim(ROLE_CLAIM, role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(signingKey)
            .compact()
    }

    fun extractSubject(token: String): String? =
        runCatching { parseClaims(token).subject }.getOrNull()

    fun extractRole(token: String): String? =
        runCatching { parseClaims(token)[ROLE_CLAIM]?.toString() }.getOrNull()

    fun isTokenValid(token: String): Boolean =
        runCatching { parseClaims(token).expiration.after(Date()) }.getOrDefault(false)

    private fun parseClaims(token: String): Claims =
        Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
}
