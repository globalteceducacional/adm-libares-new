package com.libare.adm.shared.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    // Reaplica a autenticacao tambem no dispatch de erro (/error), evitando que um 500 vire 403.
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
        val subject = jwtService.extractSubject(token)
        val rawRole = jwtService.extractRole(token)
        // Tokens antigos sem claim "role" passam a ser tratados como ADMIN para não retornar 403 após login legado.
        val role = (rawRole?.takeIf { it.isNotBlank() } ?: "ADMIN").uppercase()
        val isValid = jwtService.isTokenValid(token)

        if (!subject.isNullOrBlank() &&
            isValid &&
            SecurityContextHolder.getContext().authentication == null
        ) {
            val authentication = UsernamePasswordAuthenticationToken(
                subject,
                null,
                listOf(SimpleGrantedAuthority("ROLE_$role"))
            )
            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }
}
