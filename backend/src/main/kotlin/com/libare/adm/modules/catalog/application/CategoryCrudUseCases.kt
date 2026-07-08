package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.CategoryResponse
import com.libare.adm.modules.catalog.api.dto.UpsertCategoryRequest
import com.libare.adm.modules.catalog.application.policy.BookPolicy
import com.libare.adm.modules.catalog.infrastructure.persistence.entity.CategoryEntity
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.CategoryJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ListCategoriesUseCase(
    private val categoryRepository: CategoryJpaRepository,
    private val authorizationService: AuthorizationService
) {
    fun execute(): List<CategoryResponse> {
        authorizationService.check("books.view")
        return categoryRepository.findAllByOrderByIdDesc().map(::toResponse)
    }
}

@Service
class CreateCategoryUseCase(
    private val categoryRepository: CategoryJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(request: UpsertCategoryRequest): CategoryResponse {
        bookPolicy.requireCreate()
        val name = request.name.trim()
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw BadRequestException("Ja existe uma categoria com este nome")
        }
        val saved = categoryRepository.save(
            CategoryEntity(
                name = name,
                image = request.image?.trim().orEmpty(),
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class UpdateCategoryUseCase(
    private val categoryRepository: CategoryJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(categoryId: Int, request: UpsertCategoryRequest): CategoryResponse {
        bookPolicy.requireUpdate()
        val existing = categoryRepository.findById(categoryId)
            .orElseThrow { NotFoundException("Categoria nao encontrada") }
        val name = request.name.trim()
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, categoryId)) {
            throw BadRequestException("Ja existe uma categoria com este nome")
        }
        val saved = categoryRepository.save(
            CategoryEntity(
                id = existing.id,
                name = name,
                image = request.image?.trim() ?: existing.image,
                status = if (request.status.trim() == "0") 0 else 1
            )
        )
        return toResponse(saved)
    }
}

@Service
class DeleteCategoryUseCase(
    private val categoryRepository: CategoryJpaRepository,
    private val bookPolicy: BookPolicy
) {
    @Transactional
    fun execute(categoryId: Int) {
        bookPolicy.requireDelete()
        val existing = categoryRepository.findById(categoryId)
            .orElseThrow { NotFoundException("Categoria nao encontrada") }
        categoryRepository.save(
            CategoryEntity(
                id = existing.id,
                name = existing.name,
                image = existing.image,
                status = 0
            )
        )
    }
}

private fun toResponse(row: CategoryEntity) = CategoryResponse(
    id = row.id,
    name = row.name,
    image = row.image.ifBlank { null },
    status = row.status.toString()
)
