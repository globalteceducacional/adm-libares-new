package com.libare.adm.shared.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    override fun shouldNotFilterErrorDispatch(): Boolean = false

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")
        if (authHeader.isNullOrBlank() || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        val principal = jwtService.extractAdminPrincipal(token)
        val isValid = jwtService.isTokenValid(token)

        if (principal != null && isValid && SecurityContextHolder.getContext().authentication == null) {
            val authorities = buildAuthorities(principal)
            val authentication = UsernamePasswordAuthenticationToken(
                principal,
                null,
                authorities
            )
            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }

    private fun buildAuthorities(principal: AdminPrincipal): List<SimpleGrantedAuthority> {
        if (principal.isSuperAdmin) {
            return listOf(SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        }
        val fromPermissions = principal.permissions.map { SimpleGrantedAuthority("PERM_$it") }
        return fromPermissions.ifEmpty { listOf(SimpleGrantedAuthority("ROLE_ADMIN")) }
    }
}
