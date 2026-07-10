package com.libare.adm.modules.schools.application

import com.libare.adm.modules.schools.api.dto.SchoolResponse
import com.libare.adm.modules.schools.api.dto.UpsertSchoolRequest
import com.libare.adm.modules.schools.application.policy.SchoolPolicy
import com.libare.adm.modules.schools.infrastructure.persistence.entity.SchoolEntity
import com.libare.adm.modules.schools.infrastructure.persistence.repository.SchoolJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.text.Normalizer
import java.util.Locale

@Service
class ListSchoolsUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val schoolPolicy: SchoolPolicy
) {
    fun execute(): List<SchoolResponse> {
        schoolPolicy.requireView()
        val principal = TenantContext.get()
        val schools = if (principal.isSuperAdmin) {
            schoolRepository.findAllByOrderByNameAsc()
        } else {
            schoolRepository.findAllById(principal.resolvedAllowedSchoolIds()).sortedBy { it.name }
        }
        return schools.map(::toResponse)
    }
}

@Service
class GetSchoolUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val schoolPolicy: SchoolPolicy
) {
    fun execute(schoolId: Long): SchoolResponse {
        schoolPolicy.requireView()
        val school = schoolRepository.findById(schoolId)
            .orElseThrow { NotFoundException("Escola nao encontrada") }
        return toResponse(school)
    }
}

@Service
class CreateSchoolUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val schoolPolicy: SchoolPolicy,
    private val provisionSchoolRolesUseCase: ProvisionSchoolRolesUseCase
) {
    @Transactional
    fun execute(request: UpsertSchoolRequest): SchoolResponse {
        schoolPolicy.requireCreate()

        val name = request.name.trim()
        val slug = resolveUniqueSlug(request.slug?.trim()?.ifBlank { null } ?: slugify(name))

        val saved = schoolRepository.save(
            SchoolEntity(
                name = name,
                slug = slug,
                status = if (request.status.trim() == "0") "0" else "1"
            )
        )

        provisionSchoolRolesUseCase.execute(saved.id)

        return toResponse(saved)
    }

    private fun resolveUniqueSlug(baseSlug: String): String {
        var candidate = baseSlug
        var suffix = 1
        while (schoolRepository.existsBySlug(candidate)) {
            candidate = "$baseSlug-$suffix"
            suffix++
        }
        return candidate.take(80)
    }
}

@Service
class UpdateSchoolUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val schoolPolicy: SchoolPolicy
) {
    @Transactional
    fun execute(schoolId: Long, request: UpsertSchoolRequest): SchoolResponse {
        schoolPolicy.requireUpdate()

        val existing = schoolRepository.findById(schoolId)
            .orElseThrow { NotFoundException("Escola nao encontrada") }

        val name = request.name.trim()
        val slugInput = request.slug?.trim()?.ifBlank { null }
        val slug = when {
            slugInput == null -> existing.slug
            slugInput.equals(existing.slug, ignoreCase = true) -> existing.slug
            schoolRepository.existsBySlugAndIdNot(slugInput, schoolId) ->
                throw BadRequestException("Ja existe uma escola com este slug")
            else -> slugInput
        }

        val updated = schoolRepository.save(
            SchoolEntity(
                id = existing.id,
                name = name,
                slug = slug,
                status = if (request.status.trim() == "0") "0" else "1",
                createdAt = existing.createdAt,
                updatedAt = existing.updatedAt
            )
        )

        return toResponse(updated)
    }
}

@Service
class DeleteSchoolUseCase(
    private val schoolRepository: SchoolJpaRepository,
    private val schoolPolicy: SchoolPolicy
) {
    @Transactional
    fun execute(schoolId: Long) {
        schoolPolicy.requireDelete()

        val existing = schoolRepository.findById(schoolId)
            .orElseThrow { NotFoundException("Escola nao encontrada") }

        schoolRepository.save(
            SchoolEntity(
                id = existing.id,
                name = existing.name,
                slug = existing.slug,
                status = "0",
                createdAt = existing.createdAt,
                updatedAt = existing.updatedAt
            )
        )
    }
}

private fun toResponse(school: SchoolEntity): SchoolResponse =
    SchoolResponse(
        id = school.id,
        name = school.name,
        slug = school.slug,
        status = school.status
    )

private fun slugify(name: String): String {
    val normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
        .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
        .lowercase(Locale.ROOT)
        .replace(Regex("[^a-z0-9]+"), "-")
        .trim('-')
    return (normalized.ifBlank { "escola" }).take(80)
}
