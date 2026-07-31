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
                        1) Abra /swagger-ui.html (UI pública).
                        2) POST /api/v1/auth/login → accessToken
                        3) Authorize → Bearer <token> para chamar os endpoints.
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
