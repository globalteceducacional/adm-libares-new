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
        private const val UID_CLAIM = "uid"
        private const val SCHOOL_ID_CLAIM = "schoolId"
        private const val SUPER_CLAIM = "super"
        private const val PERM_VERSION_CLAIM = "pv"
        private const val PERMS_CLAIM = "perms"
    }

    private val signingKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret))
    }

    fun generateAdminToken(principal: AdminPrincipal): String {
        val now = Instant.now()
        val expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES)
        val builder = Jwts.builder()
            .subject(principal.username)
            .claim(UID_CLAIM, principal.userId)
            .claim(SUPER_CLAIM, principal.isSuperAdmin)
            .claim(PERM_VERSION_CLAIM, principal.permVersion)
            .claim(PERMS_CLAIM, principal.permissions.toList())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(signingKey)

        principal.schoolId?.let { builder.claim(SCHOOL_ID_CLAIM, it) }
        return builder.compact()
    }

    @Deprecated("Usar generateAdminToken")
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

    fun extractAdminPrincipal(token: String): AdminPrincipal? =
        runCatching {
            val claims = parseClaims(token)
            val username = claims.subject?.trim().orEmpty()
            if (username.isEmpty()) {
                return@runCatching null
            }
            val userId = claims[UID_CLAIM]?.toString()?.toLongOrNull()
            if (userId != null) {
                val schoolId = claims[SCHOOL_ID_CLAIM]?.toString()?.toLongOrNull()
                val isSuperAdmin = claims[SUPER_CLAIM]?.toString()?.toBooleanStrictOrNull() == true
                val permVersion = claims[PERM_VERSION_CLAIM]?.toString()?.toIntOrNull() ?: 1
                val permissions = extractPermissions(claims)
                return@runCatching AdminPrincipal(
                    userId = userId,
                    username = username,
                    schoolId = schoolId,
                    isSuperAdmin = isSuperAdmin,
                    permissions = permissions,
                    permVersion = permVersion
                )
            }
            val role = claims[ROLE_CLAIM]?.toString()?.uppercase() ?: "ADMIN"
            AdminPrincipal(
                userId = 0,
                username = username,
                schoolId = null,
                isSuperAdmin = role == "ADMIN",
                permissions = emptySet(),
                permVersion = 1
            )
        }.getOrNull()

    fun isTokenValid(token: String): Boolean =
        runCatching { parseClaims(token).expiration.after(Date()) }.getOrDefault(false)

    private fun extractPermissions(claims: Claims): Set<String> {
        val raw = claims[PERMS_CLAIM] ?: return emptySet()
        return when (raw) {
            is Collection<*> -> raw.mapNotNull { it?.toString() }.toSet()
            else -> emptySet()
        }
    }

    private fun parseClaims(token: String): Claims =
        Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
}
