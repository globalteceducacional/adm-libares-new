package com.libare.adm.shared.tenant

import com.libare.adm.shared.security.AdminPrincipal

object TenantContext {
    private val holder = ThreadLocal<AdminPrincipal?>()

    fun set(principal: AdminPrincipal) {
        holder.set(principal)
    }

    fun get(): AdminPrincipal =
        holder.get() ?: error("Contexto de tenant nao definido")

    fun getOrNull(): AdminPrincipal? = holder.get()

    fun clear() {
        holder.remove()
    }

    fun effectiveSchoolId(): Long? = getOrNull()?.effectiveSchoolId()

    fun isSuperAdmin(): Boolean = getOrNull()?.isSuperAdmin == true
}
