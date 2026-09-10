package com.libare.adm.modules.reader.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI

/** Monta URLs absolutas de imagens/uploads no prefixo /legacy/assets. */
@Component
class LegacyAssetUrlBuilder(
    @Value("\${app.legacy.public-base-url:http://localhost:8080}") private val publicBaseUrl: String
) {
    private val base get() = publicBaseUrl.trim().removeSuffix("/")

    fun images(filename: String?): String {
        if (filename.isNullOrBlank()) return "$base/legacy/assets/images/add-image.png"
        return resolve(filename, "images")
    }

    fun imageThumb(filename: String?): String {
        if (filename.isNullOrBlank()) return images(null)
        val resolved = resolve(filename, "images")
        if (resolved.contains("/legacy/assets/images/thumbs/")) return resolved
        return resolved.replace("/legacy/assets/images/", "/legacy/assets/images/thumbs/")
    }

    fun uploads(filenameOrUrl: String?): String {
        if (filenameOrUrl.isNullOrBlank()) return ""
        return resolve(filenameOrUrl, "uploads")
    }

    /**
     * Filename relativo, URL já no painel, ou leftover do PHP
     * (`ebook.alenxandriaglobaltec.com/uploads/...`).
     */
    fun resolve(value: String, folder: String): String {
        val decoded = decodeCommonHtmlEntities(value.trim())
        if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
            return rewriteAbsolute(decoded, folder)
        }
        val path = if (decoded.startsWith("/")) decoded else "/$decoded"
        return "$base${legacyPath(path, folder)}"
    }

    private fun rewriteAbsolute(value: String, folder: String): String {
        val uri = runCatching { URI(value.replace(" ", "%20")) }.getOrNull()
        val host = uri?.host?.lowercase()
        val ours = runCatching { URI(base).host?.lowercase() }.getOrNull()
        val rewrite = host != null && (
            host in DEAD_PHP_HOSTS ||
                host == "localhost" ||
                host == "127.0.0.1" ||
                host == ours
            )
        if (!rewrite) return value
        val path = uri?.path?.ifBlank { "/" } ?: "/"
        return "$base${legacyPath(path, folder)}"
    }

    private fun legacyPath(rawPath: String, folder: String): String {
        var p = rawPath.replace(Regex("/{2,}"), "/")
        if (!p.startsWith("/")) p = "/$p"
        if (p.startsWith("/legacy/assets/")) return p
        if (p.startsWith("/uploads/") || p == "/uploads") return "/legacy/assets$p"
        if (p.startsWith("/images/")) return "/legacy/assets$p"
        val name = p.split('/').lastOrNull { it.isNotBlank() }.orEmpty()
        return "/legacy/assets/$folder/$name"
    }

    private fun decodeCommonHtmlEntities(input: String): String =
        input
            .replace("&acirc;", "â")
            .replace("&Acirc;", "Â")
            .replace("&aacute;", "á")
            .replace("&Aacute;", "Á")
            .replace("&atilde;", "ã")
            .replace("&Atilde;", "Ã")
            .replace("&ccedil;", "ç")
            .replace("&Ccedil;", "Ç")
            .replace("&eacute;", "é")
            .replace("&Eacute;", "É")
            .replace("&oacute;", "ó")
            .replace("&Oacute;", "Ó")
            .replace("&otilde;", "õ")
            .replace("&Otilde;", "Õ")
            .replace("&amp;", "&")

    companion object {
        private val DEAD_PHP_HOSTS = setOf(
            "ebook.alenxandriaglobaltec.com",
            "www.ebook.alenxandriaglobaltec.com"
        )
    }
}
