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
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiHeaders
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
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

@Tag(
    name = OpenApiTags.USERS,
    description = "Leitores do aplicativo (tbl_users). Nao confunda com Equipe do painel. " +
        "A escola vem do header ${OpenApiHeaders.SCHOOL_CONTEXT}."
)
@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val listUsersUseCase: ListUsersUseCase,
    private val createUserUseCase: CreateUserUseCase,
    private val updateUserStatusUseCase: UpdateUserStatusUseCase,
    private val updateUserAcervoUseCase: UpdateUserAcervoUseCase,
    private val deleteUserUseCase: DeleteUserUseCase
) {
    @Operation(
        summary = "Listar leitores",
        description = "Lista leitores da escola do contexto. Filtro opcional por acervo."
    )
    @AdminSecured
    @Parameter(
        name = OpenApiHeaders.SCHOOL_CONTEXT,
        `in` = ParameterIn.HEADER,
        description = OpenApiHeaders.SCHOOL_CONTEXT_DESC,
        required = false,
        schema = Schema(type = "integer", format = "int64", example = "1")
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Lista de leitores",
                content = [Content(array = ArraySchema(schema = Schema(implementation = UserResponse::class)))]
            )
        ]
    )
    @GetMapping
    fun list(
        @Parameter(description = "Filtrar por ID do acervo", example = "2")
        @RequestParam(required = false) acervoId: Long?
    ): ResponseEntity<List<UserResponse>> =
        ResponseEntity.ok(listUsersUseCase.execute(acervoId))

    @Operation(
        summary = "Criar leitor",
        description = "Cadastra leitor do app com email, senha e acervo da escola do contexto."
    )
    @AdminSecured
    @AdminWriteResponses
    @Parameter(
        name = OpenApiHeaders.SCHOOL_CONTEXT,
        `in` = ParameterIn.HEADER,
        description = OpenApiHeaders.SCHOOL_CONTEXT_DESC,
        required = false,
        schema = Schema(type = "integer", format = "int64")
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "Leitor criado",
                content = [Content(schema = Schema(implementation = UserResponse::class))]
            )
        ]
    )
    @PostMapping
    fun create(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<UserResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createUserUseCase.execute(request))

    @Operation(summary = "Atualizar status do leitor", description = "Ativa (1) ou inativa (0) o leitor.")
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Status atualizado")])
    @PutMapping("/{userId}/status")
    fun updateStatus(
        @Parameter(description = "ID do leitor") @PathVariable userId: Long,
        @Valid @RequestBody request: UpdateUserStatusRequest
    ): ResponseEntity<UserResponse> = ResponseEntity.ok(updateUserStatusUseCase.execute(userId, request))

    @Operation(summary = "Alterar acervo do leitor", description = "Vincula o leitor a outro acervo da mesma escola.")
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Acervo atualizado")])
    @PutMapping("/{userId}/acervo")
    fun updateAcervo(
        @Parameter(description = "ID do leitor") @PathVariable userId: Long,
        @Valid @RequestBody request: UpdateUserAcervoRequest
    ): ResponseEntity<UserResponse> = ResponseEntity.ok(updateUserAcervoUseCase.execute(userId, request))

    @Operation(summary = "Excluir leitor", description = "Remove o leitor do aplicativo.")
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(value = [ApiResponse(responseCode = "204", description = "Removido")])
    @DeleteMapping("/{userId}")
    fun delete(@Parameter(description = "ID do leitor") @PathVariable userId: Long): ResponseEntity<Void> {
        deleteUserUseCase.execute(userId)
        return ResponseEntity.noContent().build()
    }
}
