package com.libare.adm.modules.users.api

import com.libare.adm.modules.users.api.dto.CreateUserRequest
import com.libare.adm.modules.users.api.dto.UpdateUserAcervoRequest
import com.libare.adm.modules.users.api.dto.UpdateUserStatusRequest
import com.libare.adm.modules.users.api.dto.UserResponse
import com.libare.adm.modules.users.application.CreateUserUseCase
import com.libare.adm.modules.users.application.DeleteUserUseCase
import com.libare.adm.modules.users.application.ListUsersUseCase
import com.libare.adm.modules.users.application.UpdateUserAcervoUseCase
import com.libare.adm.modules.users.application.UpdateUserStatusUseCase
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val listUsersUseCase: ListUsersUseCase,
    private val createUserUseCase: CreateUserUseCase,
    private val updateUserStatusUseCase: UpdateUserStatusUseCase,
    private val updateUserAcervoUseCase: UpdateUserAcervoUseCase,
    private val deleteUserUseCase: DeleteUserUseCase
) {
    @GetMapping
    fun list(@RequestParam(required = false) acervoId: Long?): ResponseEntity<List<UserResponse>> =
        ResponseEntity.ok(listUsersUseCase.execute(acervoId))

    @PostMapping
    fun create(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<UserResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createUserUseCase.execute(request))

    @PutMapping("/{userId}/status")
    fun updateStatus(
        @PathVariable userId: Long,
        @Valid @RequestBody request: UpdateUserStatusRequest
    ): ResponseEntity<UserResponse> = ResponseEntity.ok(updateUserStatusUseCase.execute(userId, request))

    @PutMapping("/{userId}/acervo")
    fun updateAcervo(
        @PathVariable userId: Long,
        @Valid @RequestBody request: UpdateUserAcervoRequest
    ): ResponseEntity<UserResponse> = ResponseEntity.ok(updateUserAcervoUseCase.execute(userId, request))

    @DeleteMapping("/{userId}")
    fun delete(@PathVariable userId: Long): ResponseEntity<Void> {
        deleteUserUseCase.execute(userId)
        return ResponseEntity.noContent().build()
    }
}
