package com.libare.adm.modules.auth.application

import com.libare.adm.modules.auth.api.dto.LoginRequest
import com.libare.adm.modules.auth.api.dto.LoginResponse
import com.libare.adm.modules.auth.infrastructure.persistence.repository.AdminUserJpaRepository
import com.libare.adm.shared.exception.UnauthorizedException
import com.libare.adm.shared.security.JwtService
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.MessageDigest
import java.util.Locale

@Service
class LoginUseCase(
    private val adminUserRepository: AdminUserJpaRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    @Value("\${app.security.jwt-expiration-minutes}") private val expirationMinutes: Long
) {

    fun execute(request: LoginRequest): LoginResponse {
        val admin = adminUserRepository.findByUsername(request.username)
            .orElseThrow { UnauthorizedException("Credenciais invalidas") }

        val isPasswordValid = passwordEncoder.matches(request.password, admin.passwordHash) ||
            md5(request.password).equals(admin.passwordHash, ignoreCase = true)

        if (!isPasswordValid) {
            throw UnauthorizedException("Credenciais invalidas")
        }

        val jwt = jwtService.generateToken(admin.username, "ADMIN")
        return LoginResponse(
            accessToken = jwt,
            expiresInSeconds = expirationMinutes * 60,
            role = "ADMIN"
        )
    }

    private fun md5(raw: String): String {
        val digest = MessageDigest.getInstance("MD5").digest(raw.toByteArray())
        return digest.joinToString("") { byte -> "%02x".format(Locale.ROOT, byte) }
    }
}
