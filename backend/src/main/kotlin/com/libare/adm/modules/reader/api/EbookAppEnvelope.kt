package com.libare.adm.modules.reader.api

/** Envelope JSON legado do app leitor (Flutter). */
object EbookAppEnvelope {
    fun array(items: List<Any>): Map<String, Any> = mapOf("EBOOK_APP" to items)
    fun arrayOne(item: Map<String, Any?>): Map<String, Any> = array(listOf(item))
    /** home: objeto, não lista */
    fun obj(payload: Map<String, Any?>): Map<String, Any> = mapOf("EBOOK_APP" to payload)
}
