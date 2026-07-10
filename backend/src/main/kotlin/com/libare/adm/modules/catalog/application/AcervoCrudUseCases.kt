package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AcervoResponse
import com.libare.adm.modules.catalog.api.dto.UpsertAcervoRequest
import com.libare.adm.modules.catalog.application.policy.AcervoPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.AcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.persistence.AuditSessionContext
import com.libare.adm.shared.security.CurrentActorResolver
import com.libare.adm.shared.tenant.TenantReadGuard
import com.libare.adm.shared.util.toAcervoIdLong
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateAcervoUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val acervoPolicy: AcervoPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(request: UpsertAcervoRequest): AcervoResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val schoolId = acervoPolicy.resolveSchoolIdForCreate()
        val name = request.name.trim()
        if (acervoRepository.existsByNomeIgnoreCaseAndSchoolId(name, schoolId)) {
            throw BadRequestException("Ja existe um acervo com este nome nesta escola")
        }

        val saved = acervoRepository.save(
            AcervoEntity(
                nome = name,
                descricao = request.description?.trim()?.ifBlank { null },
                status = request.status.trim() != "0",
                schoolId = schoolId
            )
        )

        return AcervoResponse(
            id = saved.id.toAcervoIdLong(),
            name = saved.nome,
            description = saved.descricao,
            status = if (saved.status) "1" else "0",
            bookCount = 0,
            userCount = 0
        )
    }
}

@Service
class UpdateAcervoUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val acervoPolicy: AcervoPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext,
    private val tenantReadGuard: TenantReadGuard
) {
    @Transactional
    fun execute(acervoId: Long, request: UpsertAcervoRequest): AcervoResponse {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = acervoPolicy.loadForUpdate(acervoId)
        val schoolId = existing.schoolId
            ?: throw BadRequestException("Acervo sem escola vinculada")

        val name = request.name.trim()
        if (acervoRepository.existsByNomeIgnoreCaseAndSchoolIdAndIdNot(name, schoolId, existing.id)) {
            throw BadRequestException("Ja existe um acervo com este nome nesta escola")
        }

        val updated = acervoRepository.save(
            AcervoEntity(
                id = existing.id,
                nome = name,
                descricao = request.description?.trim()?.ifBlank { null },
                status = request.status.trim() != "0",
                schoolId = existing.schoolId,
                createdAt = existing.createdAt
            )
        )

        val stats = acervoRepository.findAllWithStats(tenantReadGuard.tenantSchoolId())
            .firstOrNull { it.getId() == acervoId }

        return AcervoResponse(
            id = updated.id.toAcervoIdLong(),
            name = updated.nome,
            description = updated.descricao,
            status = if (updated.status) "1" else "0",
            bookCount = stats?.getBookCount()?.toLong() ?: 0,
            userCount = stats?.getUserCount()?.toLong() ?: 0
        )
    }
}

@Service
class DeleteAcervoUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val acervoPolicy: AcervoPolicy,
    private val currentActorResolver: CurrentActorResolver,
    private val auditSessionContext: AuditSessionContext
) {
    @Transactional
    fun execute(acervoId: Long) {
        auditSessionContext.applyActor(currentActorResolver.resolveActorId())

        val existing = acervoPolicy.loadForDelete(acervoId)

        acervoRepository.save(
            AcervoEntity(
                id = existing.id,
                nome = existing.nome,
                descricao = existing.descricao,
                status = false,
                schoolId = existing.schoolId,
                createdAt = existing.createdAt
            )
        )
    }
}

@Service
class GetAcervoUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val tenantReadGuard: TenantReadGuard
) {
    fun execute(acervoId: Long): AcervoResponse {
        tenantReadGuard.requireViewPermission("acervos.view")
        val row = acervoRepository.findAllWithStats(tenantReadGuard.tenantSchoolId())
            .firstOrNull { it.getId() == acervoId }
            ?: throw NotFoundException("Acervo nao encontrado")

        return AcervoResponse(
            id = row.getId(),
            name = row.getNome(),
            description = row.getDescricao(),
            status = if (row.getStatus()) "1" else "0",
            bookCount = row.getBookCount().toLong(),
            userCount = row.getUserCount().toLong()
        )
    }
}
