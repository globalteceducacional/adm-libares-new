package com.libare.adm.reader

import com.libare.adm.modules.reader.application.LegacyAssetUrlBuilder
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LegacyAssetUrlBuilderTest {
    private val urls = LegacyAssetUrlBuilder("https://admin.alenxandriaglobaltec.com")

    @Test
    fun `reescreve PDF do host PHP descontinuado`() {
        val raw = "https://ebook.alenxandriaglobaltec.com//uploads/47332_livro.pdf"
        assertEquals(
            "https://admin.alenxandriaglobaltec.com/legacy/assets/uploads/47332_livro.pdf",
            urls.uploads(raw)
        )
    }

    @Test
    fun `filename relativo de capa vai para images`() {
        assertEquals(
            "https://admin.alenxandriaglobaltec.com/legacy/assets/images/capa.jpg",
            urls.images("capa.jpg")
        )
    }

    @Test
    fun `decodifica entidade HTML no filename da capa`() {
        assertEquals(
            "https://admin.alenxandriaglobaltec.com/legacy/assets/images/Coletânea.jpg",
            urls.images("Colet&acirc;nea.jpg")
        )
    }
}
