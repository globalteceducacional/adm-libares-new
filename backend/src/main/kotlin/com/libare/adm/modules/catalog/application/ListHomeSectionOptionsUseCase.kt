package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.HomeSectionOptionResponse
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.HomeSectionJpaRepository
import org.springframework.stereotype.Service

@Service
class ListHomeSectionOptionsUseCase(
    private val homeSectionRepository: HomeSectionJpaRepository
) {
    fun execute(): List<HomeSectionOptionResponse> =
        homeSectionRepository.findAllByStatusOrderByTitleAsc(1).map { section ->
            HomeSectionOptionResponse(
                id = section.id.toLong(),
                title = section.title
            )
        }
}
