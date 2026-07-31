package com.libare.adm.shared.openapi

import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement

/**
 * Respostas HTTP comuns para endpoints autenticados do painel.
 * Combinar com [io.swagger.v3.oas.annotations.Operation] no metodo.
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@SecurityRequirement(name = "bearer-jwt")
@ApiResponses(
    value = [
        ApiResponse(responseCode = "401", description = "Nao autenticado — JWT ausente ou invalido"),
        ApiResponse(responseCode = "403", description = "Autenticado, mas sem permissao para a operacao")
    ]
)
annotation class AdminSecured

/**
 * Respostas de erro de validacao / regra de negocio alem de 401/403.
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@ApiResponses(
    value = [
        ApiResponse(responseCode = "400", description = "Requisicao invalida — validacao ou regra de negocio"),
        ApiResponse(responseCode = "404", description = "Recurso nao encontrado")
    ]
)
annotation class AdminWriteResponses
