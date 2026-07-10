package com.libare.adm.modules.catalog.application.policy

import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.LivroAcervoJpaRepository
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.tenant.TenantSqlGuard
import org.springframework.stereotype.Component

@Component
class BookPolicy(
    private val authorizationService: AuthorizationService,
    private val livroAcervoRepository: LivroAcervoJpaRepository,
    private val acervoRepository: AcervoJpaRepository
) {
    fun requireCreate() {
        authorizationService.check("books.create")
    }

    fun requireUpdate() {
        authorizationService.check("books.update")
    }

    fun requireDelete() {
        authorizationService.check("books.delete")
    }

    fun assertBookAccessible(bookId: Long) {
        val tenantSchoolId = TenantSqlGuard.tenantSchoolIdParam() ?: return

        val links = livroAcervoRepository.findByBookId(bookId)
        if (links.isEmpty()) {
            throw ForbiddenException("Livro sem acervo vinculado")
        }

        val acervos = acervoRepository.findAllById(links.map { it.acervoId })
        val hasAccess = acervos.any { it.schoolId == tenantSchoolId }
        if (!hasAccess) {
            throw ForbiddenException("Livro nao pertence a escola do usuario")
        }
    }
}
