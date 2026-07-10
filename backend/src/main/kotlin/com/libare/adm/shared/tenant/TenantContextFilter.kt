package com.libare.adm.shared.tenant

import com.libare.adm.modules.rbac.application.ResolveAdminSchoolsUseCase
import com.libare.adm.shared.security.AdminPrincipal
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class TenantContextFilter(
    private val tenantSchoolResolver: TenantSchoolResolver,
    private val resolveAdminSchoolsUseCase: ResolveAdminSchoolsUseCase
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val principal = SecurityContextHolder.getContext().authentication?.principal
            if (principal is AdminPrincipal) {
                val allowedSchoolIds = if (principal.isSuperAdmin) {
                    emptySet()
                } else {
                    resolveAdminSchoolsUseCase.execute(principal.userId, principal.schoolId)
                }
                val enriched = principal.copy(allowedSchoolIds = allowedSchoolIds)
                val activeSchoolId = tenantSchoolResolver.resolveActiveSchoolId(request, enriched)
                TenantContext.set(enriched.copy(activeSchoolId = activeSchoolId))
            }
            filterChain.doFilter(request, response)
        } finally {
            TenantContext.clear()
        }
    }
}
