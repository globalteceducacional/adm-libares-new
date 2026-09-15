package com.libare.adm.modules.settings.api

import com.libare.adm.modules.settings.api.dto.SettingsResponse
import com.libare.adm.modules.settings.api.dto.UpdateSettingsRequest
import com.libare.adm.modules.settings.application.SettingsCrudUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = OpenApiTags.SETTINGS, description = "Definicoes globais do app leitor (tbl_settings)")
@RestController
@RequestMapping("/api/v1/settings")
class SettingsController(
    private val settingsCrudUseCase: SettingsCrudUseCase
) {
    @AdminSecured
    @Operation(summary = "Obter definicoes")
    @GetMapping
    fun get(): ResponseEntity<SettingsResponse> = ResponseEntity.ok(settingsCrudUseCase.get())

    @AdminSecured
    @Operation(summary = "Atualizar definicoes")
    @PutMapping
    fun update(@RequestBody request: UpdateSettingsRequest): ResponseEntity<SettingsResponse> =
        ResponseEntity.ok(settingsCrudUseCase.update(request))
}

@RestController
class PrivacyPolicyController(
    private val settingsCrudUseCase: SettingsCrudUseCase
) {
    /** Espelho do PHP privacyPolicy.php para o leitor. */
    @GetMapping("/privacyPolicy.php", produces = [MediaType.TEXT_HTML_VALUE])
    fun privacyPolicy(): ResponseEntity<String> {
        val body = settingsCrudUseCase.loadPrivacyHtml()
        val html = if (body.contains("<html", ignoreCase = true)) {
            body
        } else {
            """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Politica de privacidade</title></head>
            <body style="font-family:sans-serif;max-width:720px;margin:24px auto;padding:0 16px;line-height:1.5">$body</body>
            </html>
            """.trimIndent()
        }
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html)
    }
}
