package com.libare.adm.modules.auth.api

import com.libare.adm.modules.auth.api.dto.AuthMeResponse
import com.libare.adm.modules.auth.api.dto.LoginRequest
import com.libare.adm.modules.auth.api.dto.LoginResponse
import com.libare.adm.modules.auth.application.GetCurrentUserUseCase
import com.libare.adm.modules.auth.application.LoginUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = OpenApiTags.AUTH, description = "Autenticacao JWT do painel administrativo")
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val loginUseCase: LoginUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase
) {

    @Operation(
        summary = "Login no painel",
        description = "Autentica usuario administrativo com username e senha. Retorna JWT e metadados de escola e permissoes."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
        ApiResponse(responseCode = "401", description = "Credenciais invalidas")
    )
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val response = loginUseCase.execute(request)
        return ResponseEntity.ok(response)
    }

    @Operation(
        summary = "Usuario autenticado",
        description = "Retorna dados do usuario logado, permissoes e contexto de escola ativo."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Dados do usuario autenticado")
    )
    @GetMapping("/me")
    fun me(): ResponseEntity<AuthMeResponse> {
        val response = getCurrentUserUseCase.execute()
        return ResponseEntity.ok(response)
    }
}
