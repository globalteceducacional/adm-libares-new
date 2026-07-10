package com.libare.adm.shared.tenant

object TenantSqlGuard {
    /**
     * NULL = super admin sem contexto de escola (visao global).
     * Long = escola efetiva do usuario ou contexto selecionado.
     */
    fun tenantSchoolIdParam(): Long? {
        val ctx = TenantContext.getOrNull() ?: return null
        if (ctx.isSuperAdmin && ctx.activeSchoolId == null) return null
        return ctx.effectiveSchoolId()
    }

    const val ACERVO_SCHOOL_FILTER = "AND (:tenantSchoolId IS NULL OR a.school_id = :tenantSchoolId)"
}
