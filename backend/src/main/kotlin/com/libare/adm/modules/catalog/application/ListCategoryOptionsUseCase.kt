package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.CategoryOptionResponse
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.CategoryJpaRepository
import org.springframework.stereotype.Service

@Service
class ListCategoryOptionsUseCase(
    private val categoryRepository: CategoryJpaRepository
) {
    fun execute(): List<CategoryOptionResponse> =
        categoryRepository.findAllByStatusOrderByNameAsc(1).map { category ->
            CategoryOptionResponse(
                id = category.id.toLong(),
                name = category.name
            )
        }
}
