package com.libare.adm.modules.notifications.api.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class NotificationResponse(
    val id: Long,
    val title: String,
    val body: String,
    @get:JsonProperty("read")
    val read: Boolean,
    val onesignalId: String?,
    val createdAt: String?
)

data class CreateNotificationRequest(
    val title: String,
    val body: String,
    val sendPush: Boolean = true
)
