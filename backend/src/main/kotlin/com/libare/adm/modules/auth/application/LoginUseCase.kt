package com.libare.adm.modules.auth.application

import com.libare.adm.modules.auth.api.dto.LoginRequest
import com.libare.adm.modules.auth.api.dto.LoginResponse
import com.libare.adm.modules.rbac.application.ResolveAdminPermissionsUseCase
import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PanelAdminUserEntity
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.shared.exception.UnauthorizedException
import com.libare.adm.shared.security.AdminPrincipal
import com.libare.adm.shared.security.JwtService
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class LoginUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val resolveAdminPermissionsUseCase: ResolveAdminPermissionsUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    @Value("\${app.security.jwt-expiration-minutes}") private val expirationMinutes: Long
) {

    fun execute(request: LoginRequest): LoginResponse {
        val panelAdmin = panelAdminUserRepository.findByUsername(request.username).orElse(null)
            ?: throw UnauthorizedException("Credenciais invalidas")
        return loginPanelAdmin(panelAdmin, request.password)
    }

    private fun loginPanelAdmin(admin: PanelAdminUserEntity, rawPassword: String): LoginResponse {
        if (admin.status != "1") {
            throw UnauthorizedException("Usuario inativo")
        }
        if (!passwordEncoder.matches(rawPassword, admin.passwordHash)) {
            throw UnauthorizedException("Credenciais invalidas")
        }

        val permissions = resolveAdminPermissionsUseCase.execute(admin.id)
        val principal = AdminPrincipal(
            userId = admin.id,
            username = admin.username,
            schoolId = admin.schoolId,
            isSuperAdmin = admin.isSuperAdmin,
            permissions = permissions,
            permVersion = admin.permVersion
        )
        return buildResponse(principal)
    }

    private fun buildResponse(principal: AdminPrincipal): LoginResponse {
        val jwt = jwtService.generateAdminToken(principal)
        val profile = getCurrentUserUseCase.execute(principal)
        return LoginResponse(
            accessToken = jwt,
            expiresInSeconds = expirationMinutes * 60,
            isSuperAdmin = principal.isSuperAdmin,
            schoolId = profile.effectiveSchoolId,
            permissions = principal.permissions.sorted(),
            allowedSchools = profile.allowedSchools,
            requiresSchoolContext = profile.requiresSchoolContext
        )
    }
}
