package com.libare.adm.shared.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

/**
 * Expõe a pasta raiz do legado PHP (ex.: adm-libares, com subpasta images/) sob o prefixo HTTP
 * `/legacy/assets/` para o admin React sem depender de Apache na porta 80.
 */
@Configuration
class LegacyAssetsWebConfig(
    @Value("\${app.legacy.assets.root:}") private val configuredRoot: String
) : WebMvcConfigurer {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val dir = resolveRoot()
        if (dir == null) {
            log.info(
                "Assets legados desativados: defina LEGACY_ASSETS_ROOT ou coloque adm-libares em ../adm-libares " +
                    "relativo ao diretório de trabalho do processo."
            )
            return
        }
        val uri = dir.toUri().toString()
        val location = if (uri.endsWith("/")) uri else "$uri/"
        registry.addResourceHandler("/legacy/assets/**")
            .addResourceLocations(location)
            .setCachePeriod(3600)
        log.info("Servindo assets legados de {} no prefixo /legacy/assets/", dir)
    }

    private fun resolveRoot(): Path? {
        val trimmed = configuredRoot.trim()
        if (trimmed.isNotEmpty()) {
            val p = Paths.get(trimmed).toAbsolutePath().normalize()
            if (Files.isDirectory(p)) {
                return p
            }
            log.warn("LEGACY_ASSETS_ROOT / app.legacy.assets.root não é diretório válido: {}", p)
            return null
        }
        val cwd = System.getProperty("user.dir") ?: return null
        val fallback = Paths.get(cwd)
            .resolve("..")
            .resolve("adm-libares")
            .normalize()
            .toAbsolutePath()
        return if (Files.isDirectory(fallback)) {
            fallback
        } else {
            null
        }
    }
}
