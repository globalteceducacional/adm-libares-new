package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AcervoOptionResponse
import com.libare.adm.modules.catalog.api.dto.AcervoResponse
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.shared.tenant.TenantReadGuard
import org.springframework.stereotype.Service

@Service
class ListAcervosUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val tenantReadGuard: TenantReadGuard
) {
    fun execute(): List<AcervoResponse> {
        tenantReadGuard.requireViewPermission("acervos.view")
        return acervoRepository.findAllWithStats(tenantReadGuard.tenantSchoolId()).map { row ->
            AcervoResponse(
                id = row.getId(),
                name = row.getNome(),
                description = row.getDescricao(),
                status = if (row.getStatus()) "1" else "0",
                bookCount = row.getBookCount().toLong(),
                userCount = row.getUserCount().toLong()
            )
        }
    }
}

@Service
class ListAcervoOptionsUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val tenantReadGuard: TenantReadGuard
) {
    fun execute(): List<AcervoOptionResponse> {
        tenantReadGuard.requireViewPermission("acervos.view")
        return acervoRepository.findActiveOptions(tenantReadGuard.tenantSchoolId()).map { row ->
            AcervoOptionResponse(
                id = row.getId(),
                name = row.getNome()
            )
        }
    }
}
