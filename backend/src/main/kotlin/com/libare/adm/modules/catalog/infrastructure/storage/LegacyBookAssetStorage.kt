package com.libare.adm.modules.catalog.infrastructure.storage

import com.libare.adm.shared.exception.BadRequestException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import kotlin.random.Random

@Service
class LegacyBookAssetStorage(
    @Value("\${app.legacy.assets.root:}") private val configuredRoot: String,
    @Value("\${app.legacy.public-base-url:http://localhost:8080}") private val publicBaseUrl: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun storeCover(file: MultipartFile): String {
        validateImage(file)
        val filename = buildStoredFilename(file.originalFilename)
        val root = resolveRoot()
        val imagesDir = root.resolve("images")
        Files.createDirectories(imagesDir)
        val target = imagesDir.resolve(filename)
        file.inputStream.use { input ->
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING)
        }
        log.info("Capa de livro salva em {}", target)
        return filename
    }

    fun storeCatalogImage(file: MultipartFile): String = storeCover(file)

    fun storeBookFile(file: MultipartFile): StoredBookFile {
        validateBookFile(file)
        val filename = buildStoredFilename(file.originalFilename)
        val root = resolveRoot()
        val uploadsDir = root.resolve("uploads")
        Files.createDirectories(uploadsDir)
        val target = uploadsDir.resolve(filename)
        file.inputStream.use { input ->
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING)
        }
        val fileUrl = buildPublicUploadUrl(filename)
        log.info("Arquivo de livro salvo em {} ({})", target, fileUrl)
        return StoredBookFile(filename = filename, fileUrl = fileUrl)
    }

    fun buildPublicUploadUrl(filename: String): String {
        val base = publicBaseUrl.trim().removeSuffix("/")
        return "$base/legacy/assets/uploads/$filename"
    }

    private fun validateImage(file: MultipartFile) {
        if (file.isEmpty) {
            throw BadRequestException("Selecione uma imagem de capa valida")
        }
        val contentType = file.contentType?.lowercase().orEmpty()
        if (!contentType.startsWith("image/")) {
            throw BadRequestException("A capa deve ser um arquivo de imagem")
        }
    }

    private fun validateBookFile(file: MultipartFile) {
        if (file.isEmpty) {
            throw BadRequestException("Selecione um arquivo de livro valido")
        }
        val originalName = file.originalFilename?.lowercase().orEmpty()
        val allowed = listOf(".pdf", ".epub")
        if (allowed.none { originalName.endsWith(it) }) {
            throw BadRequestException("O arquivo do livro deve ser PDF ou EPUB")
        }
    }

    private fun buildStoredFilename(originalFilename: String?): String {
        val sanitized = sanitizeFilename(originalFilename)
        return "${Random.nextInt(0, 100_000)}_$sanitized"
    }

    private fun sanitizeFilename(originalFilename: String?): String {
        val raw = originalFilename?.trim().orEmpty().ifBlank { "arquivo" }
        val decoded = decodeHtmlEntities(raw)
        val withoutSpaces = decoded.replace(" ", "-")
        return withoutSpaces.replace(Regex("[<>:\"|?*\\\\]"), "")
    }

    private fun decodeHtmlEntities(value: String): String =
        value
            .replace("&ccedil;", "ç", ignoreCase = true)
            .replace("&atilde;", "ã", ignoreCase = true)
            .replace("&aacute;", "á", ignoreCase = true)
            .replace("&eacute;", "é", ignoreCase = true)
            .replace("&iacute;", "í", ignoreCase = true)
            .replace("&oacute;", "ó", ignoreCase = true)
            .replace("&uacute;", "ú", ignoreCase = true)
            .replace("&acirc;", "â", ignoreCase = true)
            .replace("&ecirc;", "ê", ignoreCase = true)
            .replace("&ocirc;", "ô", ignoreCase = true)
            .replace("&agrave;", "à", ignoreCase = true)
            .replace("&nbsp;", " ")

    private fun resolveRoot(): Path {
        val trimmed = configuredRoot.trim()
        if (trimmed.isNotEmpty()) {
            val configured = Paths.get(trimmed).toAbsolutePath().normalize()
            if (Files.isDirectory(configured)) {
                return configured
            }
            throw BadRequestException("Diretorio de assets legados invalido: $configured")
        }

        val cwd = System.getProperty("user.dir") ?: throw BadRequestException("Diretorio de trabalho indisponivel")
        val fallback = Paths.get(cwd)
            .resolve("..")
            .resolve("adm-libares")
            .normalize()
            .toAbsolutePath()
        if (Files.isDirectory(fallback)) {
            return fallback
        }

        throw BadRequestException(
            "Assets legados indisponiveis. Defina LEGACY_ASSETS_ROOT apontando para a pasta adm-libares."
        )
    }

    data class StoredBookFile(
        val filename: String,
        val fileUrl: String
    )
}
