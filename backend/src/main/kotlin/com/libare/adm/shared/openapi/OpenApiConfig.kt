package com.libare.adm.shared.openapi

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun openAPI(): OpenAPI =
        OpenAPI()
            .info(
                Info()
                    .title("ADM Libare API")
                    .version("1.0")
                    .description(
                        """
                        Documentação Admin (`/api/v1/**`).
                        1) POST /api/v1/auth/login → accessToken
                        2) No Swagger UI: Authorize → Bearer <token>
                        UI e /v3/api-docs exigem JWT admin (use extensão de header no browser se a página retornar 401).
                        """.trimIndent()
                    )
            )
            .components(
                Components().addSecuritySchemes(
                    "bearer-jwt",
                    SecurityScheme()
                        .name("bearer-jwt")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                )
            )
            .addSecurityItem(SecurityRequirement().addList("bearer-jwt"))

    @Bean
    fun adminApi(): GroupedOpenApi =
        GroupedOpenApi.builder()
            .group("admin")
            .displayName("Admin")
            .pathsToMatch("/api/v1/**")
            .build()
}
