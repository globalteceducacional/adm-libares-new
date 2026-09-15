package com.libare.adm.modules.notifications.application

import com.fasterxml.jackson.databind.ObjectMapper
import com.libare.adm.modules.notifications.api.dto.CreateNotificationRequest
import com.libare.adm.modules.notifications.api.dto.NotificationResponse
import com.libare.adm.modules.settings.application.SettingsCrudUseCase
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.tenant.TenantContext
import org.slf4j.LoggerFactory
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.sql.ResultSet
import java.time.Duration

@Service
class NotificationsUseCase(
    private val jdbc: JdbcTemplate,
    private val authorizationService: AuthorizationService,
    private val settingsCrudUseCase: SettingsCrudUseCase,
    private val objectMapper: ObjectMapper
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build()

    fun list(): List<NotificationResponse> {
        authorizationService.check("notifications.view")
        val userId = TenantContext.get().userId
        return jdbc.query(
            """
            SELECT id, title, body, is_read, onesignal_id, created_at
            FROM app_notifications
            WHERE admin_user_id IS NULL OR admin_user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
            """.trimIndent(),
            { rs, _ -> mapRow(rs) },
            userId
        )
    }

    fun unreadCount(): Long {
        authorizationService.check("notifications.view")
        val userId = TenantContext.get().userId
        return jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM app_notifications
            WHERE (admin_user_id IS NULL OR admin_user_id = ?) AND is_read = 0
            """.trimIndent(),
            Long::class.java,
            userId
        ) ?: 0L
    }

    fun markRead(id: Long) {
        authorizationService.check("notifications.view")
        val userId = TenantContext.get().userId
        jdbc.update(
            "UPDATE app_notifications SET is_read = 1 WHERE id = ? AND (admin_user_id IS NULL OR admin_user_id = ?)",
            id,
            userId
        )
    }

    fun markAllRead() {
        authorizationService.check("notifications.view")
        val userId = TenantContext.get().userId
        jdbc.update(
            "UPDATE app_notifications SET is_read = 1 WHERE admin_user_id IS NULL OR admin_user_id = ?",
            userId
        )
    }

    fun create(request: CreateNotificationRequest): NotificationResponse {
        authorizationService.check("notifications.create")
        val title = request.title.trim()
        val body = request.body.trim()
        if (title.isEmpty() || body.isEmpty()) {
            throw BadRequestException("Titulo e mensagem sao obrigatorios")
        }
        var onesignalId: String? = null
        if (request.sendPush) {
            onesignalId = sendOnesignal(title, body)
        }
        jdbc.update(
            """
            INSERT INTO app_notifications (admin_user_id, title, body, is_read, onesignal_id)
            VALUES (NULL, ?, ?, 0, ?)
            """.trimIndent(),
            title,
            body,
            onesignalId
        )
        val id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java) ?: 0L
        return jdbc.query(
            "SELECT id, title, body, is_read, onesignal_id, created_at FROM app_notifications WHERE id = ?",
            { rs, _ -> mapRow(rs) },
            id
        ).first()
    }

    private fun sendOnesignal(title: String, message: String): String? {
        val (appId, restKey) = settingsCrudUseCase.loadOnesignalCredentials()
        if (appId.isBlank() || restKey.isBlank()) {
            log.info("OneSignal nao configurado; notificacao fica apenas no painel")
            return null
        }
        val payload = mapOf(
            "app_id" to appId,
            "included_segments" to listOf("All"),
            "headings" to mapOf("en" to title, "pt" to title),
            "contents" to mapOf("en" to message, "pt" to message)
        )
        return try {
            val json = objectMapper.writeValueAsString(payload)
            val req = HttpRequest.newBuilder(URI.create("https://onesignal.com/api/v1/notifications"))
                .timeout(Duration.ofSeconds(12))
                .header("Authorization", "Basic $restKey")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build()
            val res = http.send(req, HttpResponse.BodyHandlers.ofString())
            if (res.statusCode() !in 200..299) {
                log.warn("OneSignal HTTP {}", res.statusCode())
                return null
            }
            val tree = objectMapper.readTree(res.body())
            tree.path("id").asText(null)
        } catch (ex: Exception) {
            log.warn("Falha ao enviar OneSignal: {}", ex.message)
            null
        }
    }

    private fun mapRow(rs: ResultSet): NotificationResponse =
        NotificationResponse(
            id = rs.getLong("id"),
            title = rs.getString("title").orEmpty(),
            body = rs.getString("body").orEmpty(),
            read = rs.getInt("is_read") == 1,
            onesignalId = rs.getString("onesignal_id"),
            createdAt = rs.getTimestamp("created_at")?.toInstant()?.toString()
        )
}
