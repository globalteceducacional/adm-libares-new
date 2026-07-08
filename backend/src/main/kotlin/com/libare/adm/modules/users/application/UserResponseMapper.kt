package com.libare.adm.modules.users.application

import com.libare.adm.modules.catalog.infrastructure.persistence.repository.AcervoJpaRepository
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.infrastructure.persistence.entity.UserEntity
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import com.libare.adm.shared.util.toAcervoIdLong
import org.springframework.stereotype.Service

@Service
class UserResponseMapper(
    private val acervoRepository: AcervoJpaRepository
) {
    fun fromEntity(user: UserEntity): UserResponse {
        val acervoName = user.acervoId?.let { acervoId ->
            acervoRepository.findById(acervoId).orElse(null)?.nome
        }
        return UserResponse(
            id = user.id,
            name = user.name,
            email = user.email,
            phone = user.phone,
            userType = user.userType,
            userImage = user.userImage,
            status = user.status,
            acervoId = user.acervoId?.toAcervoIdLong(),
            acervoName = acervoName
        )
    }

    fun fromProjection(row: UserJpaRepository.UserListProjection): UserResponse =
        UserResponse(
            id = row.getId(),
            name = row.getName(),
            email = row.getEmail(),
            phone = row.getPhone(),
            userType = row.getUserType(),
            userImage = row.getUserImage(),
            status = row.getStatus(),
            acervoId = row.getAcervoId()?.toLong(),
            acervoName = row.getAcervoName()
        )
}
