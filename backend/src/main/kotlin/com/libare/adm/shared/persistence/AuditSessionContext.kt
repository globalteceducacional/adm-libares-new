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
        entityManager.createNativeQuery("SET @app_user_id = :actorId")
            .setParameter("actorId", actorId)
            .executeUpdate()
    }
}
