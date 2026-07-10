package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.infrastructure.persistence.entity.LivroAcervoEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.util.toAcervoIds
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SyncBookAcervosUseCase(
    private val acervoRepository: AcervoJpaRepository,
    private val livroAcervoRepository: LivroAcervoJpaRepository,
    private val authorizationService: AuthorizationService
) {
    @Transactional
    fun execute(bookId: Long, acervoIds: List<Long>) {
        val distinctIds = acervoIds.toAcervoIds()
        if (distinctIds.isEmpty()) {
            throw BadRequestException("Selecione ao menos um acervo")
        }

        val acervos = acervoRepository.findAllById(distinctIds)
        if (acervos.size != distinctIds.size) {
            throw BadRequestException("Um ou mais acervos informados nao existem")
        }

        val inactive = acervos.filter { !it.status }
        if (inactive.isNotEmpty()) {
            throw BadRequestException("Acervo inativo nao pode ser vinculado: ${inactive.first().nome}")
        }

        val schoolIds = acervos.mapNotNull { it.schoolId }.distinct()
        if (schoolIds.isEmpty()) {
            throw BadRequestException("Acervos sem escola vinculada")
        }
        if (schoolIds.size != 1) {
            throw BadRequestException("Acervos devem pertencer a mesma escola")
        }
        authorizationService.assertSameSchool(schoolIds.single())

        livroAcervoRepository.deleteByBookId(bookId)
        livroAcervoRepository.flush()

        distinctIds.forEach { acervoId ->
            livroAcervoRepository.save(
                LivroAcervoEntity(
                    bookId = bookId,
                    acervoId = acervoId
                )
            )
        }
    }
}
