package com.libare.adm.shared.persistence

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager

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

        // Garante que @app_user_id seja resetado ao final da transacao,
        // evitando vazamento de contexto entre requisicoes no pool de conexoes.
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(object : TransactionSynchronization {
                override fun afterCompletion(status: Int) {
                    runCatching {
                        entityManager.createNativeQuery("SET @app_user_id = NULL").executeUpdate()
                    }
                }
            })
        }
    }
}
