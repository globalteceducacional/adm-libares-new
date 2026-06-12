package com.libare.adm.modules.catalog.application

import com.libare.adm.modules.catalog.api.dto.AuthorOptionResponse
import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AuthorLookupRepository
import org.springframework.stereotype.Service

@Service
class ListAuthorOptionsUseCase(
    private val authorLookupRepository: AuthorLookupRepository
) {
    fun execute(): List<AuthorOptionResponse> =
        authorLookupRepository.findActiveAuthorOptions()
            .map { author ->
                AuthorOptionResponse(
                    id = author.getId(),
                    name = author.getName(),
                    image = author.getImage()
                )
            }
}
