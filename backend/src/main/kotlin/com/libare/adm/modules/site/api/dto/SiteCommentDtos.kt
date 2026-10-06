package com.libare.adm.modules.site.api.dto

import jakarta.validation.constraints.Pattern

data class SiteCommentResponse(
    val id: Long,
    /** Sites.id (coluna legada book_id). */
    val siteId: Long,
    /** Alias de siteId — coluna fisica book_id. */
    val bookId: Long,
    val userId: Long,
    val userName: String,
    val userEmail: String,
    val userImage: String,
    val userType: String,
    val commentText: String,
    val dtRate: String?,
    val commentOn: String,
    val status: String
)

data class UpdateSiteCommentStatusRequest(
    @field:Pattern(regexp = "^[01]$", message = "status deve ser '0' ou '1'")
    val status: String
)
