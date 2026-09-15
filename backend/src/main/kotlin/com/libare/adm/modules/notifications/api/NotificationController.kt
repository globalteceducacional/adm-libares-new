package com.libare.adm.modules.notifications.api

import com.libare.adm.modules.notifications.api.dto.CreateNotificationRequest
import com.libare.adm.modules.notifications.api.dto.NotificationResponse
import com.libare.adm.modules.notifications.application.NotificationsUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = OpenApiTags.NOTIFICATIONS, description = "Notificacoes do painel e envio OneSignal")
@AdminSecured
@RestController
@RequestMapping("/api/v1/notifications")
class NotificationController(
    private val notificationsUseCase: NotificationsUseCase
) {
    @Operation(summary = "Listar notificacoes")
    @GetMapping
    fun list(): ResponseEntity<List<NotificationResponse>> = ResponseEntity.ok(notificationsUseCase.list())

    @Operation(summary = "Contagem nao lidas")
    @GetMapping("/unread-count")
    fun unread(): ResponseEntity<Map<String, Long>> =
        ResponseEntity.ok(mapOf("count" to notificationsUseCase.unreadCount()))

    @Operation(summary = "Marcar como lida")
    @PostMapping("/{id}/read")
    fun markRead(@PathVariable id: Long): ResponseEntity<Void> {
        notificationsUseCase.markRead(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "Marcar todas como lidas")
    @PostMapping("/read-all")
    fun markAll(): ResponseEntity<Void> {
        notificationsUseCase.markAllRead()
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "Criar notificacao (e push OneSignal se configurado)")
    @PostMapping
    fun create(@RequestBody request: CreateNotificationRequest): ResponseEntity<NotificationResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(notificationsUseCase.create(request))
}
