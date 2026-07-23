package com.libare.adm.modules.site.reader

/**
 * Envelope JSON legado de [api_sites.php] — chave raiz **Galileu** (nao EBOOK_APP).
 */
object GalileuEnvelope {
    fun wrap(payload: Any): Map<String, Any> = mapOf("Galileu" to payload)
}
