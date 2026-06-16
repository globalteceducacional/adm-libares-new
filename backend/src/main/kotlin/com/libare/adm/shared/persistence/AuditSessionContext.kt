package com.libare.adm.shared.persistence

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Component

@Component
class AuditSessionContext {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    fun applyActor(actorId: Long?) {
        if (actorId == null) {
            return
        }
        // PostgreSQL: variavel de sessao via set_config (equivalente ao SET @app_user_id do MySQL).
        entityManager.createNativeQuery("SELECT set_config('app.user_id', :actorId, false)")
            .setParameter("actorId", actorId.toString())
            .singleResult
    }
}
