package com.libare.adm.modules.auth.api

import com.libare.adm.modules.auth.api.dto.AuthMeResponse
import com.libare.adm.modules.auth.api.dto.LoginRequest
import com.libare.adm.modules.auth.api.dto.LoginResponse
import com.libare.adm.modules.auth.application.GetCurrentUserUseCase
import com.libare.adm.modules.auth.application.LoginUseCase
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val loginUseCase: LoginUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase
) {

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val response = loginUseCase.execute(request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/me")
    fun me(): ResponseEntity<AuthMeResponse> {
        val response = getCurrentUserUseCase.execute()
        return ResponseEntity.ok(response)
    }
}
