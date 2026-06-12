package com.libare.adm.modules.users.api

import com.libare.adm.modules.users.api.dto.UpdateUserStatusRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.DeleteUserUseCase
import com.libare.adm.modules.users.application.ListUsersUseCase
import com.libare.adm.modules.users.application.UpdateUserStatusUseCase
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val listUsersUseCase: ListUsersUseCase,
    private val updateUserStatusUseCase: UpdateUserStatusUseCase,
    private val deleteUserUseCase: DeleteUserUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<UserResponse>> = ResponseEntity.ok(listUsersUseCase.execute())

    @PutMapping("/{userId}/status")
    fun updateStatus(
        @PathVariable userId: Long,
        @Valid @RequestBody request: UpdateUserStatusRequest
    ): ResponseEntity<UserResponse> = ResponseEntity.ok(updateUserStatusUseCase.execute(userId, request))

    @DeleteMapping("/{userId}")
    fun delete(@PathVariable userId: Long): ResponseEntity<Void> {
        deleteUserUseCase.execute(userId)
        return ResponseEntity.noContent().build()
    }
}
