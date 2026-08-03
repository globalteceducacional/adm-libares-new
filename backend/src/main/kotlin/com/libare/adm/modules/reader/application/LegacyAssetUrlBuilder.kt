package com.libare.adm.modules.reader.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/** Monta URLs absolutas de imagens/uploads no prefixo /legacy/assets. */
@Component
class LegacyAssetUrlBuilder(
    @Value("\${app.legacy.public-base-url:http://localhost:8080}") private val publicBaseUrl: String
) {
    private val base get() = publicBaseUrl.trim().removeSuffix("/")

    fun images(filename: String?): String {
        if (filename.isNullOrBlank()) return "$base/legacy/assets/images/add-image.png"
        if (filename.startsWith("http://") || filename.startsWith("https://")) return filename
        return "$base/legacy/assets/images/$filename"
    }

    fun imageThumb(filename: String?): String {
        if (filename.isNullOrBlank()) return images(null)
        return "$base/legacy/assets/images/thumbs/$filename"
    }

    fun uploads(filenameOrUrl: String?): String {
        if (filenameOrUrl.isNullOrBlank()) return ""
        if (filenameOrUrl.startsWith("http://") || filenameOrUrl.startsWith("https://")) return filenameOrUrl
        return "$base/legacy/assets/uploads/$filenameOrUrl"
    }
}
