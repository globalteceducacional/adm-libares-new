package com.libare.adm.modules.users.application

import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.infrastructure.persistence.repository.UserJpaRepository
import org.springframework.stereotype.Service

@Service
class ListUsersUseCase(
    private val userRepository: UserJpaRepository
) {
    fun execute(): List<UserResponse> =
        userRepository.findAllByStatus("1")
            .sortedByDescending { it.id }
            .map { user ->
                UserResponse(
                    id = user.id,
                    name = user.name,
                    email = user.email,
                    phone = user.phone,
                    userType = user.userType,
                    userImage = user.userImage,
                    status = user.status
                )
            }
}
